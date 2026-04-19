"""
generate_sample_geotiff.py

Generates a synthetic 4-band (Red, Green, Blue, NIR) GeoTIFF mimicking
a Sentinel-2 scene. The scene is georeferenced over Hyderabad, India
(near NRSC headquarters) with EPSG:32644 (UTM Zone 44N) projection.

Water features (lake, river, flood zone) are embedded so that
dual-band NDWI (Green - NIR) / (Green + NIR) returns positive values
over water pixels — validating the full detection pipeline.

Usage:
    python generate_sample_geotiff.py

Requires:
    pip install rasterio numpy
"""

import numpy as np


def generate():
    """Create a synthetic 4-band GeoTIFF with embedded water features."""
    import rasterio
    from rasterio.transform import from_bounds
    from rasterio.crs import CRS

    # --- Scene geometry: Hyderabad, India in UTM Zone 44N ---
    # Approximate bounding box around Hussain Sagar Lake area
    # EPSG:32644 coordinates (meters)
    left = 237000    # easting
    bottom = 1913000  # northing
    width_m = 5120    # 5.12 km
    height_m = 5120

    pixel_size = 10  # 10m resolution (Sentinel-2 Bands 2,3,4,8)
    cols = width_m // pixel_size  # 512 pixels
    rows = height_m // pixel_size

    right = left + width_m
    top = bottom + height_m

    transform = from_bounds(left, bottom, right, top, cols, rows)
    crs = CRS.from_epsg(32644)  # UTM Zone 44N (Hyderabad)

    np.random.seed(42)

    # --- Base terrain: vegetation + bare soil ---
    # Vegetation: high NIR, moderate Green
    # Sentinel-2 L1C reflectance scaled to [0, 10000]
    red = np.random.randint(600, 1200, (rows, cols), dtype=np.uint16)
    green = np.random.randint(500, 1000, (rows, cols), dtype=np.uint16)
    blue = np.random.randint(300, 700, (rows, cols), dtype=np.uint16)
    nir = np.random.randint(2000, 4000, (rows, cols), dtype=np.uint16)

    # --- Water body 1: circular lake (Hussain Sagar analog) ---
    lake_cx, lake_cy = cols // 2, rows * 2 // 5  # center of scene
    yy, xx = np.ogrid[:rows, :cols]
    lake_mask = ((xx - lake_cx) ** 2 + (yy - lake_cy) ** 2) < 70 ** 2

    # Water: low NIR, moderate Green → NDWI > 0
    red[lake_mask] = np.random.randint(150, 350, lake_mask.sum(), dtype=np.uint16)
    green[lake_mask] = np.random.randint(400, 700, lake_mask.sum(), dtype=np.uint16)
    blue[lake_mask] = np.random.randint(500, 900, lake_mask.sum(), dtype=np.uint16)
    nir[lake_mask] = np.random.randint(50, 200, lake_mask.sum(), dtype=np.uint16)

    # --- Water body 2: sinuous river ---
    for row in range(rows):
        river_center = int(350 + 25 * np.sin(row / 35.0))
        half_width = np.random.randint(5, 10)
        x0 = max(0, river_center - half_width)
        x1 = min(cols, river_center + half_width)
        n_px = x1 - x0
        red[row, x0:x1] = np.random.randint(100, 300, n_px, dtype=np.uint16)
        green[row, x0:x1] = np.random.randint(350, 650, n_px, dtype=np.uint16)
        blue[row, x0:x1] = np.random.randint(400, 800, n_px, dtype=np.uint16)
        nir[row, x0:x1] = np.random.randint(30, 150, n_px, dtype=np.uint16)

    # --- Water body 3: irregular flood zone (bottom-right quadrant) ---
    flood_base = (xx > 320) & (yy > 370)
    flood_noise = np.random.random((rows, cols)) > 0.35
    flood_mask = flood_base & flood_noise

    red[flood_mask] = np.random.randint(200, 400, flood_mask.sum(), dtype=np.uint16)
    green[flood_mask] = np.random.randint(450, 750, flood_mask.sum(), dtype=np.uint16)
    blue[flood_mask] = np.random.randint(400, 700, flood_mask.sum(), dtype=np.uint16)
    nir[flood_mask] = np.random.randint(40, 180, flood_mask.sum(), dtype=np.uint16)

    # --- Write GeoTIFF ---
    output_path = "sample_sentinel2_hyderabad.tif"

    with rasterio.open(
        output_path,
        "w",
        driver="GTiff",
        height=rows,
        width=cols,
        count=4,
        dtype="uint16",
        crs=crs,
        transform=transform,
    ) as dst:
        dst.write(red, 1)
        dst.write(green, 2)
        dst.write(blue, 3)
        dst.write(nir, 4)
        dst.set_band_description(1, "Red (B4)")
        dst.set_band_description(2, "Green (B3)")
        dst.set_band_description(3, "Blue (B2)")
        dst.set_band_description(4, "NIR (B8)")
        dst.update_tags(
            SENSOR="Sentinel-2A (simulated)",
            LOCATION="Hyderabad, India (near NRSC HQ)",
            PRODUCT_TYPE="Synthetic L1C",
        )

    # --- Verify NDWI ---
    green_f = green.astype(np.float32)
    nir_f = nir.astype(np.float32)
    ndwi = (green_f - nir_f) / (green_f + nir_f + 1e-6)
    water_pixels = np.sum(ndwi > 0)
    total_pixels = ndwi.size
    water_pct = round(water_pixels / total_pixels * 100, 1)

    print(f"[OK] Generated: {output_path}")
    print(f"  CRS:        EPSG:32644 (UTM Zone 44N)")
    print(f"  Dimensions: {cols} × {rows} px @ 10m resolution")
    print(f"  Bands:      4 (Red, Green, Blue, NIR)")
    print(f"  Bounds:     {left}, {bottom} → {right}, {top} (meters)")
    print(f"  Water (NDWI > 0): {water_pixels:,} px ({water_pct}%)")
    print(f"  Features:   lake, river, flood zone")
    print()
    print("Upload this file to the Satellite Telemetry Hub to test")
    print("the dual-band NDWI + GDAL reprojection + GeoJSON export pipeline.")


if __name__ == "__main__":
    generate()
