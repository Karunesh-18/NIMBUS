import requests

urls = [
    "https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/Bangalore/BBMP.geojson",
    "https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/Bangalore/bbmp_wards.geojson",
    "https://raw.githubusercontent.com/nileshtrivedi/bbmp-ward-data/master/wards.geojson",
    "https://raw.githubusercontent.com/civis-india/bbmp/master/geojson/wards.geojson",
]
for url in urls:
    try:
        r = requests.get(url, timeout=10)
        status = r.status_code
        print(f"{status} - {url}")
        if status == 200:
            data = r.json()
            feat_count = len(data.get("features", []))
            print(f"  -> type={data.get('type')}, features={feat_count}")
    except Exception as e:
        print(f"ERR - {url}: {e}")
