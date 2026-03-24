import requests

def test_api():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Origin': 'https://camfit.co.kr',
        'Referer': 'https://camfit.co.kr/'
    }
    
    camp_id = '61e38c7f96a4ab001ece2ecc'
    urls_to_try = [
        f'https://api.camfit.co.kr/v1/camp/{camp_id}',
        f'https://api.camfit.co.kr/v1/camps/{camp_id}',
        f'https://api.camfit.co.kr/camp/{camp_id}',
        f'https://api.camfit.co.kr/v2/camp/{camp_id}',
    ]
    
    for url in urls_to_try:
        try:
            r = requests.get(url, headers=headers, timeout=5)
            print(f"URL: {url}")
            print(f"Status: {r.status_code}")
            if r.status_code == 200:
                print("Response:", r.text[:200])
                break
        except Exception as e:
            print(f"Error on {url}: {e}")

if __name__ == "__main__":
    test_api()
