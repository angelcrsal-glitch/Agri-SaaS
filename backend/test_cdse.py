import os
from sentinelhub import SHConfig, SentinelHubRequest, DataCollection, BBox, CRS, MimeType

config = SHConfig()
config.sh_client_id = "sh-06bd6ca2-e147-4dde-91b5-cfe1051c1740"
config.sh_client_secret = "pLdqSbGBnY9HUqsWQYDm63P5ZMrHctAf"
config.sh_token_url = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
config.sh_base_url = "https://sh.dataspace.copernicus.eu"

evalscript = """
//VERSION=3
function setup() {
    return {
        input: ["B04", "B03", "B02", "dataMask"],
        output: { bands: 4 }
    };
}
function evaluatePixel(sample) {
    return [sample.B04, sample.B03, sample.B02, sample.dataMask];
}
"""

bbox = BBox(bbox=[-101.9, 27.0, -101.8, 27.1], crs=CRS.WGS84)

cdse_collection = DataCollection.SENTINEL2_L2A.define_from("CDSE_S2L2A", service_url=config.sh_base_url)

request = SentinelHubRequest(
    evalscript=evalscript,
    input_data=[
        SentinelHubRequest.input_data(
            data_collection=cdse_collection,
            time_interval=("2026-07-01", "2026-08-01"),
        )
    ],
    responses=[SentinelHubRequest.output_response('default', MimeType.PNG)],
    bbox=bbox,
    size=(100, 100),
    config=config
)

try:
    data = request.get_data()
    print("SUCCESS: Data retrieved.")
except Exception as e:
    print(f"FAILED: {e}")
