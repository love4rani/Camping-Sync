import requests
import math
from bs4 import BeautifulSoup
import time

import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# ==========================================
# [설정] 환경변수 및 사용자 정보
# ==========================================
GOCAMPING_API_KEY = os.getenv("GOCAMPING_API_KEY", "")  # 공공데이터포털 서비스키
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

if not GOCAMPING_API_KEY or not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
    print("경고: .env 파일에 필요한 환경변수가 누락되었습니다.")

# 사용자 위치 (위도, 경도) - 예: 서초구, 가산동
HOME_COORDS = (37.459479, 127.025171)  # 집
WORK_COORDS = (37.4780439, 126.8815648)  # 회사

# 필터 조건
MAX_PRICE = 50000
TARGET_FLOOR = "파쇄석"
TARGET_PARKING = "옆"  # 사이트 옆 주차

# ==========================================
# 모듈 B: 거리 계산 (Haversine 공식)
# ==========================================
def calculate_distance(coord1, coord2):
    """두 좌표 사이의 직선 거리를 km 단위로 계산"""
    R = 6371  # 지구 반지름 (km)
    lat1, lon1 = map(math.radians, coord1)
    lat2, lon2 = map(math.radians, coord2)
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def estimate_travel_time(distance_km):
    """직선 거리를 기반으로 이동 시간(분)을 대략적으로 추정 (평균 60km/h 가정)"""
    # 실제 환경에서는 Naver/Kakao API를 사용하는 것이 정확합니다.
    return (distance_km / 60) * 60 * 1.5  # 1.5는 굴곡도 가중치

# ==========================================
# 모듈 A: GoCamping 데이터 수집 및 필터링
# ==========================================
def get_filtered_campgrounds():
    print("캠핑장 데이터 수집 시작...")
    url = "http://apis.data.go.kr/B551011/GoCamping/basedList"
    params = {
        "serviceKey": GOCAMPING_API_KEY,
        "numOfRows": 100,  # 프로토타입용 샘플 수
        "pageNo": 1,
        "MobileOS": "ETC",
        "MobileApp": "CampingBot",
        "_type": "json"
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        items = data.get('response', {}).get('body', {}).get('items', {}).get('item', [])
        
        filtered = []
        for item in items:
            # 1. 시설 필터링 (파쇄석, 사이트 옆 주차)
            intro = item.get('intro', '')
            feature = item.get('featureNm', '')
            content = intro + feature
            
            if TARGET_FLOOR in content and TARGET_PARKING in content:
                # 2. 거리 필터링
                camp_coords = (float(item['mapY']), float(item['mapX']))
                dist_home = calculate_distance(HOME_COORDS, camp_coords)
                dist_work = calculate_distance(WORK_COORDS, camp_coords)
                
                time_home = estimate_travel_time(dist_home)
                time_work = estimate_travel_time(dist_work)
                
                # 두 곳 모두 120분 이내인 경우
                if time_home <= 120 and time_work <= 120:
                    # 가격 정보는 API에서 제공하지 않는 경우가 많아 스크래핑 단계에서 확인 권장
                    # 여기서는 구조만 잡습니다.
                    filtered.append({
                        'name': item['facltNm'],
                        'addr': item['addr1'],
                        'res_url': item.get('resveUrl', ''),
                        'dist_info': f"집:{int(time_home)}분 / 회사:{int(time_work)}분"
                    })
        return filtered
    except Exception as e:
        print(f"데이터 수집 중 오류 발생: {e}")
        return []

# ==========================================
# 모듈 C: 실시간 예약 스크래핑 (웹 크롤링)
# ==========================================
def check_reservation_status(res_url):
    """예약 사이트에서 잔여석 여부를 체크하는 스크래퍼"""
    if not res_url or res_url.strip() == "":
        return False
    
    try:
        # 차단 방지를 위한 User-Agent 헤더 추가
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(res_url, headers=headers, timeout=10)
        
        # 인코딩 문제 임시 해결
        response.encoding = response.apparent_encoding
        soup = BeautifulSoup(response.text, 'html.parser')
        
        page_text = soup.get_text(strip=True)
        
        # 1. '예약 불가' 및 '만석' 키워드 필터링 (다수 사이트 공통 발생어)
        sold_out_keywords = ['예약마감', '예약불가', '종료', '만석', 'Sold out', '남은자리없음', '예약완료']
        
        for keyword in sold_out_keywords:
            if keyword in page_text:
                print(f"[알림] 예약 불가 감지: {keyword} ({res_url})")
                return False  # 예약 마감
                
        # 2. 확실히 예약 가능한 긍정 키워드
        available_keywords = ['예약하기', '실시간 예약', '남은 자리', '예약 가능']
        for keyword in available_keywords:
            if keyword in page_text:
                return True

        # 페이지를 읽었으나 확실한 키워드가 없는 경우, 일단 자리가 있을 가능성이 있으므로 True
        return True
    except Exception as e:
        print(f"[{res_url}] 스크래핑 오류 발생: {e}")
        return False

# ==========================================
# 모듈 D: 텔레그램 알림 전송
# ==========================================
def send_telegram_msg(camp_info):
    text = (
        f"⛺ [캠핑장 발견!]\n"
        f"이름: {camp_info['name']}\n"
        f"위치: {camp_info['addr']}\n"
        f"이동시간: {camp_info['dist_info']}\n"
        f"예약링크: {camp_info['res_url']}\n"
        f"지금 바로 확인해보세요!"
    )
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": text}
    requests.post(url, json=payload)

# ==========================================
# 메인 실행 로직
# ==========================================
def main():
    print("시스템 가동 중...")
    
    # 1. 필터링된 캠핑장 목록 가져오기
    campgrounds = get_filtered_campgrounds()
    print(f"조건에 맞는 캠핑장 {len(campgrounds)}개 발견.")
    
    for camp in campgrounds:
        # 2. 실시간 예약 가능 여부 체크
        if check_reservation_status(camp['res_url']):
            print(f"알림 전송: {camp['name']}")
            # 3. 알림 전송
            send_telegram_msg(camp)
            # API 과부하 방지를 위한 짧은 휴식
            time.sleep(1)

if __name__ == "__main__":
    main()
