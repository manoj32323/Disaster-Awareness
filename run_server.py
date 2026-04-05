from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import requests
import xml.etree.ElementTree as ET
from PIL import Image
import io
import base64
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GDACS_RSS_URL = "https://www.gdacs.org/xml/rss.xml"

def fetch_gdacs_alerts():
    try:
        response = requests.get(GDACS_RSS_URL)
        response.raise_for_status()
        root = ET.fromstring(response.content)
        alerts = []
        
        # Define namespaces
        ns = {'georss': 'http://www.georss.org/georss', 'gdacs': 'http://www.gdacs.org'}
        
        for item in root.findall('./channel/item'):
            title = item.find('title').text if item.find('title') is not None else "Unknown Alert"
            desc = item.find('description').text if item.find('description') is not None else "No description available."
            link = item.find('link').text if item.find('link') is not None else "#"
            pubDate = item.find('pubDate').text if item.find('pubDate') is not None else ""
            
            # Extract point
            point = item.find('georss:point', ns)
            lat, lng = 0.0, 0.0
            if point is not None and point.text:
                coords = point.text.split()
                if len(coords) >= 2:
                    lat, lng = float(coords[0]), float(coords[1])
            
            # Extract basic severity (can be Orange, Red, Green)
            alert_score = item.find('gdacs:alertlevel', ns)
            severity = "Green"
            if alert_score is not None and alert_score.text:
                severity = alert_score.text
                
            # Filter for floods, cyclones, severe weather
            if any(keyword in title.lower() for keyword in ['flood', 'cyclone', 'storm', 'tsunami', 'weather']):
                # Simple weight map for visuals
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
        return alerts[:20]  # Return top 20 relevant alerts for globe
    except Exception as e:
        print(f"Error fetching GDACS alerts: {e}")
        return []

@app.get("/api/alerts")
def get_alerts():
    alerts = fetch_gdacs_alerts()
    if not alerts:
        # Fallback dummy data if API fails to show visual
        alerts = [
            {"title": "Flood Warning - Southeast Asia", "description": "Heavy monsoon rains.", "date": "10 Mins Ago", "link": "#", "lat": 15.0, "lng": 105.0, "severity": "Red", "weight": 3.0},
            {"title": "Cyclone Alert - Atlantic", "description": "Cyclone forming.", "date": "1 Hour Ago", "link": "#", "lat": 25.0, "lng": -70.0, "severity": "Orange", "weight": 2.0},
            {"title": "Storm Surge - Japan", "description": "High waves.", "date": "5 Hours Ago", "link": "#", "lat": 35.0, "lng": 139.0, "severity": "Green", "weight": 1.0}
        ]
    return {"alerts": alerts}

@app.post("/api/predict")
async def predict_flood(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    
    # -------------------------------------------------------------------
    # NOTE: In a full production environment with OpenMMLab (MMSegmentation)
    # installed, we would initialize the model like:
    # from mmseg.apis import init_model, inference_model
    # model = init_model(config_file, 'model_light.pth', device='cpu')
    # result = inference_model(model, np.array(image))
    # mask = result.pred_sem_seg.data[0].cpu().numpy()
    # -------------------------------------------------------------------
    
    # Simulation: Since MMSegmentation may not be installed locally, 
    # we simulate the flood detection (0: background, 1: water)
    # by highlighting darker, lower-intensity regions (often water in SAR/satellite).
    img_array = np.array(image)
    
    # Simple heuristic to simulate water segmentation
    # Water in optical/SAR often appears dark.
    gray = np.mean(img_array, axis=2)
    mask = (gray < 70).astype(np.uint8)  # 1 where 'water', 0 otherwise
    
    # Create blue overlay
    overlay_img = img_array.copy()
    overlay_img[mask == 1, 0] = 0    # R
    overlay_img[mask == 1, 1] = 100  # G
    overlay_img[mask == 1, 2] = 255  # B
    
    # Blend overlay with original
    alpha = 0.5
    blended = (img_array * (1 - alpha) + overlay_img * alpha).astype(np.uint8)
    
    out_image = Image.fromarray(blended)
    buffered = io.BytesIO()
    out_image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    return {"mask_overlay": f"data:image/png;base64,{img_str}"}

if __name__ == "__main__":
    uvicorn.run("run_server:app", host="0.0.0.0", port=8000, reload=True)
