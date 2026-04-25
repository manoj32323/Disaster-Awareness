# Disaster Awareness Platform

A full-stack, AI-powered disaster awareness and monitoring platform. It provides live disaster alerts from the Global Disaster Alert and Coordination System (GDACS) and performs automated flood segmentation using satellite imagery.

## Features

- **Live Global Alerts**: Real-time disaster alerts fetched from the GDACS RSS feed.
- **AI Flood Segmentation**: Upload satellite imagery (GeoTIFF or standard image formats) to receive an AI-generated flood mask with percentage coverage. Supports true dual-band NDWI for multispectral imagery and RGB proxies.
- **Geospatial Processing**: Built-in support for Rasterio, GDAL, and GeoPandas for extracting robust metadata and exporting vectorized flood masks (GeoJSON).
- **Interactive Globe Interface**: 3D globe visualization built with Next.js, `react-globe.gl`, and Three.js.

## Tech Stack

- **Frontend**: Next.js (React), Tailwind CSS, Three.js, Lucide React
- **Backend**: FastAPI (Python), Uvicorn, NumPy, SciPy, Pillow
- **Geospatial Processing**: Rasterio, GeoPandas, Shapely

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python 3.9+

### Backend Setup

1. Navigate to the project root.
2. Create a virtual environment and install the requirements:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Run the FastAPI server:
   ```bash
   python run_server.py
   ```
   The backend API will run on `http://localhost:8000`.

### Frontend Setup

1. Navigate to the `next_app` directory:
   ```bash
   cd next_app
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
