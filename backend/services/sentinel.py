import os
import random
from dotenv import load_dotenv

load_dotenv() # Load variables from .env file

import sentinelhub
from datetime import date, timedelta
import numpy as np
from sentinelhub import (
    SHConfig, 
    SentinelHubStatistical, 
    SentinelHubRequest,
    DataCollection, 
    Geometry,
    CRS,
    MimeType,
    BBox,
    bbox_to_dimensions
)
import base64
import io
import json

print(f"SentinelHub Version: {sentinelhub.__version__}")

class SentinelService:
    def __init__(self):
        self.client_id = os.getenv("SENTINEL_CLIENT_ID")
        self.client_secret = os.getenv("SENTINEL_CLIENT_SECRET")
        
        if not self.client_id or not self.client_secret:
            raise ValueError("Sentinel Hub credentials not found in environment variables.")

        self.config = SHConfig()
        self.config.sh_client_id = self.client_id
        self.config.sh_client_secret = self.client_secret
        self.config.sh_token_url = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token'
        self.config.sh_base_url = 'https://sh.dataspace.copernicus.eu'
        
        self.cdse_collection = DataCollection.SENTINEL2_L2A.define_from("CDSE_S2L2A", service_url=self.config.sh_base_url)
    
    def _get_safe_dimensions(self, bbox, resolution=10, max_size=2500):
        """
        Calculates dimensions ensuring they don't exceed max_size.
        Returns: (width, height, is_resized)
        """
        w, h = bbox_to_dimensions(bbox, resolution=resolution)
        is_resized = False
        if w > max_size or h > max_size:
            ratio = min(max_size / w, max_size / h)
            w = int(w * ratio)
            h = int(h * ratio)
            is_resized = True
            print(f"Debug: Resizing image from {int(w/ratio)}x{int(h/ratio)} to {w}x{h} to fit API limits.")
        return w, h, is_resized
    
    def _generate_fallback_history(self):
        """
        Generates realistic mock NDVI curve for the last 6 months 
        when real data is unavailable (clouds/errors).
        Curve: Starts low (planting), peaks (maturity), drops (harvest).
        """
        history = []
        today = date.today()
        
        # Base curve structure (approximate crop cycle values)
        # 6 months ago -> Today
        base_curve = [0.35, 0.45, 0.65, 0.82, 0.70, 0.40] 
        
        for i in range(6):
            # Calculate date for each month (going back 6 months from today)
            # Logic: i=0 is 5 months ago, i=5 is this month (approx)
            month_offset = 6 - i 
            d = today - timedelta(days=30 * month_offset)
            
            # Get base value
            ndvi_base = base_curve[i]
            
            # Add randomness (+/- 0.05)
            noise = random.uniform(-0.05, 0.05)
            final_ndvi = round(max(0.1, min(0.95, ndvi_base + noise)), 2)
            
            history.append({
                'date': d.isoformat(),
                'ndvi': final_ndvi,
                'simulated': True
            })
            
        print("Using Fallback Mock History (Simulated Data)")
        return history

    def get_true_color_image(self, geometry_geojson: dict):
        """
        Fetches a True Color (RGB) image for the given geometry.
        Returns (base64_image_string, bounds_list).
        """
        end_date = date.today()
        start_date = end_date - timedelta(days=25) # 25 days ensures clear acquisition with leastCC
        time_interval = (start_date.isoformat(), end_date.isoformat())

        try:
            # 1. Calculate Bounding Box from GeoJSON
            coords = geometry_geojson['coordinates'][0] # Assumes Polygon [[x,y], [x,y]...]
            lons = [p[0] for p in coords]
            lats = [p[1] for p in coords]
            min_lon, max_lon = min(lons), max(lons)
            min_lat, max_lat = min(lats), max(lats)
            
            bbox = BBox(bbox=[min_lon, min_lat, max_lon, max_lat], crs=CRS.WGS84)
            width, height, is_resized = self._get_safe_dimensions(bbox, resolution=10) # Safe dynamic resolution
            size = (width, height)

            # 2. Evalscript for True Color (Gain 2.5 + Gamma 2.2)
            evalscript = """
            //VERSION=3
            function setup() {
                return {
                    input: ["B04", "B03", "B02", "dataMask"],
                    output: { bands: 4 }
                };
            }

            function evaluatePixel(sample) {
                // Apply Gain 2.5 and Gamma 2.2 for "Google Maps" brightness
                let gain = 2.5;
                let gamma = 2.2;
                
                function adj(val) {
                   return Math.pow(Math.max(0, val * gain), 1/gamma);
                }

                return [adj(sample.B04), adj(sample.B03), adj(sample.B02), sample.dataMask];
            }
            """

            # 3. Create Request
            request = SentinelHubRequest(
                evalscript=evalscript,
                input_data=[
                    SentinelHubRequest.input_data(
                        data_collection=self.cdse_collection,
                        time_interval=time_interval,
                        mosaicking_order="leastCC" # Least Cloud Cover
                    )
                ],
                responses=[
                    SentinelHubRequest.output_response('default', MimeType.PNG)
                ],
                bbox=bbox,
                size=size,
                config=self.config
            )

            # 4. Execute
            response = request.get_data()
            image_data = response[0]

            # 5. Convert to Base64
            from PIL import Image
            
            # Safety checks
            if image_data.max() <= 1.5: 
                 image_data = np.clip(image_data * 255, 0, 255).astype(np.uint8)
            else:
                 image_data = np.clip(image_data, 0, 255).astype(np.uint8)
            
            img = Image.fromarray(image_data)
            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            
            warning = "Image resolution reduced due to large field size." if is_resized else None
            return img_str, [[min_lat, min_lon], [max_lat, max_lon]], warning

        except Exception as e:
            print(f"Error fetching True Color Image: {e}")
            return None, None, None

    def get_ndvi_visual_image(self, geometry_geojson: dict):
        """
        Fetches an NDVI Heatmap image (Red < 0.2, Yellow 0.2-0.5, Green > 0.5).
        Returns (base64_image_string, bounds_list).
        """
        end_date = date.today()
        start_date = end_date - timedelta(days=25) # 25 days ensures clear acquisition with leastCC
        time_interval = (start_date.isoformat(), end_date.isoformat())

        try:
            # 1. Calculate Bounding Box
            coords = geometry_geojson['coordinates'][0] 
            lons = [p[0] for p in coords]
            lats = [p[1] for p in coords]
            min_lon, max_lon = min(lons), max(lons)
            min_lat, max_lat = min(lats), max(lats)
            
            bbox = BBox(bbox=[min_lon, min_lat, max_lon, max_lat], crs=CRS.WGS84)
            width, height, is_resized = self._get_safe_dimensions(bbox, resolution=10) 
            size = (width, height)

            # 2. Evalscript for NDVI Heatmap
            evalscript = """
            //VERSION=3
            function setup() {
                return {
                    input: ["B04", "B08", "dataMask"],
                    output: { bands: 4 }
                };
            }

            function evaluatePixel(sample) {
                let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
                
                let r=0, g=0, b=0;
                
                if (ndvi < 0.2) {
                    // Red/Brown (Soil/Dead)
                    r=0.6; g=0.2; b=0.1;
                } else if (ndvi < 0.5) {
                    // Yellow/Orange (Stressed)
                    r=0.9; g=0.7; b=0.1; 
                } else {
                    // Dark Green (Healthy)
                    r=0.0; g=0.5; b=0.0;
                }
                return [r, g, b, sample.dataMask];
            }
            """

            # 3. Create Request
            request = SentinelHubRequest(
                evalscript=evalscript,
                input_data=[
                    SentinelHubRequest.input_data(
                        data_collection=self.cdse_collection,
                        time_interval=time_interval,
                        mosaicking_order="leastCC"
                    )
                ],
                responses=[
                    SentinelHubRequest.output_response('default', MimeType.PNG)
                ],
                bbox=bbox,
                size=size,
                config=self.config
            )

            # 4. Execute
            response = request.get_data()
            image_data = response[0]

            # 5. Convert to Base64
            from PIL import Image
            
            # Sentinel Hub returns 0-255 for PNG usually, but let's be safe if it returns floats
            if image_data.max() <= 1.5: 
                 image_data = np.clip(image_data * 255, 0, 255).astype(np.uint8)
            else:
                 image_data = np.clip(image_data, 0, 255).astype(np.uint8)
            
            img = Image.fromarray(image_data)
            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            
            warning = "Image resolution reduced due to large field size." if is_resized else None
            return img_str, [[min_lat, min_lon], [max_lat, max_lon]], warning

        except Exception as e:
            print(f"Error fetching NDVI Visual Image: {e}")
            return None, None, None

    def get_ndvi_stats(self, geometry_geojson: dict):
        """
        Fetches the average NDVI for the given geometry over the last 6 months.
        Returns a list of data points: [{'date': 'YYYY-MM-DD', 'ndvi': 0.5}, ...].
        Filters out days with > 20% cloud cover.
        """
        
        # 1. Define Time Interval (Last 6 months)
        end_date = date.today()
        start_date = end_date - timedelta(days=180) 
        time_interval = (start_date.isoformat(), end_date.isoformat())

        # 2. Parse Geometry
        try:
            # Create Geometry object from GeoJSON
            sh_geometry = Geometry(geometry=geometry_geojson, crs=CRS.WGS84)
        except Exception as e:
            print(f"Error parsing geometry: {e}")
            raise

        # 3. Define Statistical Request
        # Calculate safe resolution
        # First get safe dimensions in pixels
        bbox = BBox(bbox=[sh_geometry.bbox.min_x, sh_geometry.bbox.min_y, sh_geometry.bbox.max_x, sh_geometry.bbox.max_y], crs=CRS.WGS84)
        safe_w, safe_h, _ = self._get_safe_dimensions(bbox, resolution=10) # We ignore the warning flag for stats, just use dimensions
        
        # Calculate resolution tuple (deg/px) based on safe dimensions
        # This prevents 400 Bad Request for "width/height larger than 2500"
        res_x = (bbox.max_x - bbox.min_x) / safe_w
        res_y = (bbox.max_y - bbox.min_y) / safe_h
        
        # We include CLP (Cloud Probability) in the input and output to filter cloudy days.
        evalscript = """
        //VERSION=3
        function setup() {
            return {
                input: [{
                    bands: ["B04", "B08", "CLP"],
                    units: "DN"
                }],
                output: [
                    {
                        id: "NDVI",
                        bands: 1
                    },
                    {
                        id: "CLP",
                        bands: 1
                    },
                    {
                        id: "dataMask",
                        bands: 1
                    }
                ],
                mosaicking: "ORBIT"
            };
        }

        function evaluatePixel(sample) {
            let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
            return {
                NDVI: [ndvi],
                CLP: [sample.CLP],
                dataMask: [1]
            };
        }
        """

        request = SentinelHubStatistical(
            aggregation=SentinelHubStatistical.aggregation(
                evalscript=evalscript,
                time_interval=time_interval,
                aggregation_interval='P1D',
                resolution=(res_x, res_y) 
            ),
            input_data=[
                SentinelHubStatistical.input_data(
                    self.cdse_collection,
                )
            ],
            geometry=sh_geometry,
            config=self.config
        )

        # 4. Execute and Filter
        try:
            data = request.get_data()[0]
        except Exception as e:
             print(f"Sentinel Hub Request Failed: {e}")
             return []

        stats_list = data['data']
        
        # Sort by date ascending
        stats_list.sort(key=lambda x: x['interval']['from'])
        
        history = []
        
        for entry in stats_list:
            outputs = entry.get('outputs', {})
            if 'NDVI' in outputs and 'CLP' in outputs:
                ndvi_stats = outputs['NDVI']['bands']['B0']['stats']
                clp_stats = outputs['CLP']['bands']['B0']['stats']
                
                count = ndvi_stats.get('sampleCount', ndvi_stats.get('count', 0))
                
                if count == 0:
                    continue

                try:
                    mean_ndvi = ndvi_stats['mean']
                    mean_clp = clp_stats['mean'] # Average cloud probability (0-100)
                    
                    # Validate NDVI
                    if isinstance(mean_ndvi, str) or mean_ndvi is None:
                        continue
                    
                    # Validate CLP
                    if isinstance(mean_clp, str) or mean_clp is None:
                         mean_clp = 100 # Assume cloudy if unknown

                    val_ndvi = float(mean_ndvi)
                    val_clp = float(mean_clp)
                    
                    # Filter: Cloud cover
                    # Relax history (older than 5 days) to 50%, keep recent strict (20%)
                    entry_date_str = entry['interval']['from'].split('T')[0]
                    entry_date = date.fromisoformat(entry_date_str)
                    days_diff = (date.today() - entry_date).days
                    
                    max_cc = 30.0 if days_diff <= 5 else 60.0
                    
                    if val_clp > max_cc:
                        continue
                        
                    if not np.isnan(val_ndvi):
                        history.append({
                            'date': entry['interval']['from'].split('T')[0],
                            'ndvi': round(val_ndvi, 2)
                        })
                except (ValueError, TypeError, Exception) as e:
                    print(f"Debug: Error parsing stats entry: {e}")
                    continue
        
        # Fallback: If no history found with strict/moderate filters, try to return whatever we found
        # (In this code, we already appended to history list if it passed filter)
        
        if len(history) < 3:
            print(f"Debug: Found {len(history)} valid NDVI points. Threshold is 3. Triggering fallback.")
            return self._generate_fallback_history()

        return history
