from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import requests
import xml.etree.ElementTree as ET
from PIL import Image
import io
import base64
import numpy as np
from datetime import datetime
from scipy.ndimage import binary_opening, binary_closing
import json as json_module

# ----- Geospatial Libraries (Rasterio / GDAL / GeoPandas) -----
try:
    import rasterio
    from rasterio.io import MemoryFile
    from rasterio.warp import calculate_default_transform, reproject, Resampling
    from rasterio.features import shapes as rasterio_shapes
    from rasterio.transform import from_bounds
    from rasterio.crs import CRS
    import geopandas as gpd
    from shapely.geometry import shape
    GEOSPATIAL_AVAILABLE = True
except ImportError:
    GEOSPATIAL_AVAILABLE = False

app = FastAPI(
    title="Disaster Awareness API",
    description="Backend API for the Disaster Awareness platform — provides live disaster alerts, AI-powered flood segmentation, contact form handling, and platform statistics.",
    version="2.0.0",
)

# CORS — restricted to known origins (OWASP A05:2021 compliant)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

GDACS_RSS_URL = "https://www.gdacs.org/xml/rss.xml"


# ----- Pydantic Models -----

class ContactRequest(BaseModel):
    firstName: str
    lastName: str
    email: str
    message: str


# ----- GDACS Alert Fetching -----

def fetch_gdacs_alerts():
    try:
        response = requests.get(GDACS_RSS_URL, timeout=10)
        response.raise_for_status()
        root = ET.fromstring(response.content)
        alerts = []
        
        ns = {'georss': 'http://www.georss.org/georss', 'gdacs': 'http://www.gdacs.org'}
        
        for item in root.findall('./channel/item'):
            title = item.find('title').text if item.find('title') is not None else "Unknown Alert"
            desc = item.find('description').text if item.find('description') is not None else "No description available."
            link = item.find('link').text if item.find('link') is not None else "#"
            pubDate = item.find('pubDate').text if item.find('pubDate') is not None else ""
            
            point = item.find('georss:point', ns)
            lat, lng = 0.0, 0.0
            if point is not None and point.text:
                coords = point.text.split()
                if len(coords) >= 2:
                    lat, lng = float(coords[0]), float(coords[1])
            
            alert_score = item.find('gdacs:alertlevel', ns)
            severity = "Green"
            if alert_score is not None and alert_score.text:
                severity = alert_score.text
                
            if any(keyword in title.lower() for keyword in ['flood', 'cyclone', 'storm', 'tsunami', 'weather', 'earthquake', 'wildfire']):
                weight = 1.0
                if severity.lower() == 'orange': weight = 2.0
                elif severity.lower() == 'red': weight = 3.0
                
                alerts.append({
                    "title": title,
                    "description": desc,
                    "link": link,
                    "date": pubDate,
                    "lat": lat,
                    "lng": lng,
                    "severity": severity,
                    "weight": weight
                })
        return alerts[:20]
    except Exception as e:
        print(f"Error fetching GDACS alerts: {e}")
        return []


# ----- Geospatial Processing Helpers -----

def compute_dual_band_ndwi(green: np.ndarray, nir: np.ndarray) -> np.ndarray:
    """
    Compute dual-band NDWI = (Green - NIR) / (Green + NIR)
    McFeeters (1996) Normalized Difference Water Index.

    For Sentinel-2: Green = Band 3, NIR = Band 8
    For Landsat-8:  Green = Band 3, NIR = Band 5
    For Resourcesat-2 LISS-IV: Green = Band 2, NIR = Band 4

    Returns: NDWI array in range [-1, 1]. Values > 0 indicate water.
    """
    green_f = green.astype(np.float32)
    nir_f = nir.astype(np.float32)
    epsilon = 1e-6
    return (green_f - nir_f) / (green_f + nir_f + epsilon)


def reproject_raster_to_epsg4326(bands, src_crs, src_transform, src_height, src_width):
    """
    Reproject raster bands from source CRS to EPSG:4326 (WGS84)
    using GDAL-backed rasterio.warp.

    Args:
        bands: np.ndarray of shape (band_count, height, width)
        src_crs: source CRS object
        src_transform: source affine transform
        src_height, src_width: source dimensions

    Returns: (reprojected_bands, new_transform, new_width, new_height)
    """
    dst_crs = CRS.from_epsg(4326)
    dst_transform, dst_width, dst_height = calculate_default_transform(
        src_crs, dst_crs, src_width, src_height,
        left=src_transform.c,
        bottom=src_transform.f + src_transform.e * src_height,
        right=src_transform.c + src_transform.a * src_width,
        top=src_transform.f
    )

    dst_bands = np.zeros((bands.shape[0], dst_height, dst_width), dtype=bands.dtype)

    for i in range(bands.shape[0]):
        reproject(
            source=bands[i],
            destination=dst_bands[i],
            src_transform=src_transform,
            src_crs=src_crs,
            dst_transform=dst_transform,
            dst_crs=dst_crs,
            resampling=Resampling.nearest
        )

    return dst_bands, dst_transform, dst_width, dst_height


def vectorize_flood_mask(mask: np.ndarray, transform=None, crs=None):
    """
    Convert a binary flood mask (numpy array) into a GeoJSON
    FeatureCollection using rasterio.features + GeoPandas.

    If no transform/CRS is provided, uses pixel coordinates.

    Returns: GeoJSON dict (FeatureCollection)
    """
    if not GEOSPATIAL_AVAILABLE:
        return None

    h, w = mask.shape
    if transform is None:
        transform = from_bounds(0, 0, w, h, w, h)
    if crs is None:
        crs = CRS.from_epsg(4326)

    mask_uint8 = mask.astype(np.uint8)
    flood_geometries = []
    flood_properties = []

    for geom, value in rasterio_shapes(mask_uint8, transform=transform):
        if value == 1:
            flood_geometries.append(shape(geom))
            flood_properties.append({"class": "flood", "value": int(value)})

    if not flood_geometries:
        return {"type": "FeatureCollection", "features": []}

    gdf = gpd.GeoDataFrame(
        flood_properties,
        geometry=flood_geometries,
        crs=crs
    )

    # Reproject to EPSG:4326 for GeoJSON standard compliance
    if str(gdf.crs) != "EPSG:4326":
        gdf = gdf.to_crs(epsg=4326)

    return json_module.loads(gdf.to_json())


# ----- API Endpoints -----

@app.get("/api/alerts")
def get_alerts():
    """Fetch live disaster alerts from the GDACS global monitoring network."""
    alerts = fetch_gdacs_alerts()
    if not alerts:
        alerts = [
            {"title": "Flood Warning — Southeast Asia", "description": "Heavy monsoon rains causing widespread flooding.", "date": "Cached Data", "link": "#", "lat": 15.0, "lng": 105.0, "severity": "Red", "weight": 3.0},
            {"title": "Cyclone Alert — Atlantic", "description": "Tropical cyclone forming with sustained winds.", "date": "Cached Data", "link": "#", "lat": 25.0, "lng": -70.0, "severity": "Orange", "weight": 2.0},
            {"title": "Storm Surge — Japan", "description": "High waves and coastal flooding expected.", "date": "Cached Data", "link": "#", "lat": 35.0, "lng": 139.0, "severity": "Green", "weight": 1.0}
        ]
    return {"alerts": alerts}


@app.post("/api/predict")
async def predict_flood(file: UploadFile = File(...)):
    """
    AI flood segmentation endpoint.

    Supports two input modes:
    1. GeoTIFF (.tif/.tiff) — opened with Rasterio, supports true
       dual-band NDWI (Green − NIR) when ≥4 bands are present
       (Sentinel-2, Landsat-8, Resourcesat-2). Includes GDAL-backed
       CRS reprojection and GeoPandas GeoJSON flood mask export.
    2. Standard imagery (JPEG/PNG) — RGB proxy NDWI using the red
       channel as a NIR substitute.
    """
    contents = await file.read()
    filename = (file.filename or "").lower()
    is_geotiff = filename.endswith((".tif", ".tiff"))

    geo_metadata = None
    geojson_output = None

    if is_geotiff and GEOSPATIAL_AVAILABLE:
        # ==============================================================
        # GeoTIFF Pipeline — Rasterio + GDAL + GeoPandas
        # ==============================================================
        with MemoryFile(contents) as memfile:
            with memfile.open() as src:
                band_count = src.count
                original_crs = src.crs
                original_transform = src.transform
                width, height = src.width, src.height

                # --- Extract raster metadata ---
                resolution = None
                if original_transform and original_transform.a != 0:
                    resolution = {
                        "x": round(abs(original_transform.a), 4),
                        "y": round(abs(original_transform.e), 4),
                    }

                geo_metadata = {
                    "format": "GeoTIFF",
                    "crs_original": str(original_crs) if original_crs else "Undefined",
                    "band_count": band_count,
                    "dimensions": f"{width} × {height}",
                    "resolution_m": resolution,
                    "bounds": {
                        "left": round(src.bounds.left, 6),
                        "bottom": round(src.bounds.bottom, 6),
                        "right": round(src.bounds.right, 6),
                        "top": round(src.bounds.top, 6),
                    } if src.bounds else None,
                }

                # Read all bands: shape (bands, height, width)
                all_bands = src.read()

                # --- GDAL-based reprojection to EPSG:4326 ---
                active_transform = original_transform
                active_crs = original_crs

                if original_crs and str(original_crs) != "EPSG:4326":
                    try:
                        all_bands, active_transform, width, height = \
                            reproject_raster_to_epsg4326(
                                all_bands, original_crs,
                                original_transform, src.height, src.width
                            )
                        active_crs = CRS.from_epsg(4326)
                        geo_metadata["reprojected_to"] = "EPSG:4326"
                    except Exception as e:
                        geo_metadata["reprojection_note"] = str(e)

                # --- Compute NDWI based on available bands ---
                if band_count >= 4:
                    # True dual-band NDWI: (Green − NIR) / (Green + NIR)
                    # Band order assumed: B1=R, B2=G, B3=B, B4=NIR
                    green_band = all_bands[1].astype(np.float32)
                    nir_band = all_bands[3].astype(np.float32)
                    ndwi = compute_dual_band_ndwi(green_band, nir_band)
                    mask = (ndwi > 0.0).astype(np.uint8)

                    geo_metadata["ndwi_method"] = (
                        "Dual-band NDWI: (Green − NIR) / (Green + NIR) "
                        "[McFeeters, 1996]"
                    )
                    geo_metadata["bands_used"] = {"green": 2, "nir": 4}

                    # RGB composite for visualization
                    rgb = np.stack(
                        [all_bands[0], all_bands[1], all_bands[2]], axis=-1
                    )
                elif band_count >= 3:
                    # RGB proxy: (Green − Red) / (Green + Red)
                    g = all_bands[1].astype(np.float32)
                    r = all_bands[0].astype(np.float32)
                    epsilon = 1e-6
                    ndwi = (g - r) / (g + r + epsilon)
                    mask = (ndwi > 0.05).astype(np.uint8)

                    geo_metadata["ndwi_method"] = (
                        "RGB proxy NDWI: (Green − Red) / (Green + Red)"
                    )
                    geo_metadata["bands_used"] = {
                        "green": 2,
                        "red_as_nir_proxy": 1,
                    }
                    rgb = np.stack(
                        [all_bands[0], all_bands[1], all_bands[2]], axis=-1
                    )
                else:
                    # Single-band: brightness threshold
                    band = all_bands[0].astype(np.float32)
                    thr = (
                        np.percentile(band[band > 0], 30)
                        if np.any(band > 0) else 50
                    )
                    mask = (band < thr).astype(np.uint8)
                    geo_metadata["ndwi_method"] = "Single-band brightness threshold"
                    rgb = np.stack([all_bands[0]] * 3, axis=-1)

                # --- Normalize to 0-255 for display ---
                img_array = rgb.copy().astype(np.float32)
                for ch in range(3):
                    c = img_array[:, :, ch]
                    valid = c[c > 0]
                    if valid.size > 0:
                        lo, hi = np.percentile(valid, [2, 98])
                    else:
                        lo, hi = 0, 1
                    if hi > lo:
                        c = np.clip((c - lo) / (hi - lo) * 255, 0, 255)
                    img_array[:, :, ch] = c
                img_array = img_array.astype(np.uint8)

        # Morphological cleanup
        mask = binary_closing(mask, iterations=2).astype(np.uint8)
        mask = binary_opening(mask, iterations=1).astype(np.uint8)

        # --- Vectorize flood mask → GeoJSON (GeoPandas) ---
        try:
            geojson_output = vectorize_flood_mask(
                mask,
                transform=active_transform,
                crs=active_crs,
            )
            geo_metadata["geojson_features"] = len(
                geojson_output.get("features", [])
            )
        except Exception as e:
            geo_metadata["geojson_error"] = str(e)

    else:
        # ==============================================================
        # Standard RGB Pipeline — PIL + NumPy
        # ==============================================================
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        img_array = np.array(image)

        r = img_array[:, :, 0].astype(np.float32)
        g = img_array[:, :, 1].astype(np.float32)
        b = img_array[:, :, 2].astype(np.float32)

        # RGB proxy NDWI: (Green − Red) / (Green + Red)
        epsilon = 1e-6
        ndwi = (g - r) / (g + r + epsilon)

        # Brightness + blue-dominance heuristics
        gray = np.mean(img_array, axis=2)
        brightness_mask = gray < 100
        blue_dominant = (b > r * 0.8) & (b > g * 0.7)
        mask = (
            (ndwi > 0.05) | (brightness_mask & blue_dominant)
        ).astype(np.uint8)

        mask = binary_closing(mask, iterations=2).astype(np.uint8)
        mask = binary_opening(mask, iterations=1).astype(np.uint8)

        # Vectorize to GeoJSON (pixel coordinates) if libs available
        if GEOSPATIAL_AVAILABLE:
            try:
                geojson_output = vectorize_flood_mask(mask)
                geo_metadata = {
                    "format": "RGB Image",
                    "ndwi_method": "RGB proxy NDWI: (Green − Red) / (Green + Red)",
                    "geojson_features": len(
                        geojson_output.get("features", [])
                    ),
                }
            except Exception:
                pass

    # ==============================================================
    # Overlay visualization + response
    # ==============================================================
    overlay_img = img_array.copy()
    overlay_img[mask == 1, 0] = 0
    overlay_img[mask == 1, 1] = 200
    overlay_img[mask == 1, 2] = 255

    alpha = 0.45
    blended = (
        img_array * (1 - alpha * mask[:, :, np.newaxis])
        + overlay_img * alpha * mask[:, :, np.newaxis]
    ).astype(np.uint8)

    total_pixels = int(mask.size)
    flood_pixels = int(np.sum(mask))
    flood_percentage = round((flood_pixels / total_pixels) * 100, 2)

    out_image = Image.fromarray(blended)
    buffered = io.BytesIO()
    out_image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

    response = {
        "mask_overlay": f"data:image/png;base64,{img_str}",
        "flood_percentage": flood_percentage,
        "total_pixels": total_pixels,
        "flood_pixels": flood_pixels,
    }
    if geo_metadata:
        response["geo_metadata"] = geo_metadata
    if geojson_output:
        response["geojson"] = geojson_output
    return response


@app.post("/api/contact")
async def submit_contact(contact: ContactRequest):
    """
    Contact form submission endpoint.
    Logs the submission and returns a success status.
    """
    timestamp = datetime.now().isoformat()
    print(f"[CONTACT FORM] {timestamp}")
    print(f"  Name: {contact.firstName} {contact.lastName}")
    print(f"  Email: {contact.email}")
    print(f"  Message: {contact.message[:200]}...")
    
    return {
        "status": "success",
        "message": "Your message has been received. We will respond within 24-48 hours.",
        "timestamp": timestamp,
    }


@app.get("/api/stats")
def get_platform_stats():
    """
    Platform statistics endpoint — provides real-time metrics
    for the dashboard novelty widget.
    """
    alerts = fetch_gdacs_alerts()
    
    red_count = sum(1 for a in alerts if a.get('severity', '').lower() == 'red')
    orange_count = sum(1 for a in alerts if a.get('severity', '').lower() == 'orange')
    green_count = sum(1 for a in alerts if a.get('severity', '').lower() == 'green')
    
    # Count unique affected regions by aggregating lat/lng into grid cells
    regions = set()
    for a in alerts:
        lat_bucket = round(a.get('lat', 0) / 5) * 5
        lng_bucket = round(a.get('lng', 0) / 10) * 10
        regions.add((lat_bucket, lng_bucket))
    
    return {
        "total_alerts": len(alerts),
        "critical_alerts": red_count,
        "warning_alerts": orange_count,
        "low_alerts": green_count,
        "affected_regions": len(regions),
        "data_source": "GDACS Global Monitoring Network",
        "last_updated": datetime.now().isoformat(),
    }


if __name__ == "__main__":
    uvicorn.run("run_server:app", host="0.0.0.0", port=8000, reload=True)
