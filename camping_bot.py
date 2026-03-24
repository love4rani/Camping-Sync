import requests
import math
from bs4 import BeautifulSoup
import time

import os
import json
from datetime import datetime, timezone
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

API_URL = "https://script.google.com/macros/s/AKfycbyReQ-uGXRS2MwI2se5bRYPrcx15lewKXMlX4PtOqpuR8dKUzwC5ZieyrEoJIf9xZyE/exec"

def get_settings():
    try:
        response = requests.get(API_URL, timeout=(5, 10))  # (connect, read)
        return response.json()
    except Exception as e:
        print(f"설정 로드 실패 (Google Sheets): {e}")
        return None

def update_last_run_time():
    try:
        payload = {"lastRunTime": datetime.now(timezone.utc).isoformat()}
        requests.post(API_URL, data=json.dumps(payload), headers={'Content-Type': 'text/plain'}, timeout=(5, 10))
    except Exception as e:
        print(f"마지막 실행시간 갱신 실패: {e}")

# ==========================================
# [설정] 환경변수 및 사용자 정보
# ==========================================
GOCAMPING_API_KEY = os.getenv("GOCAMPING_API_KEY", "")  # 공공데이터포털 서비스키
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

print(f"[시작] GOCAMPING_API_KEY 설정: {'O' if GOCAMPING_API_KEY else 'X (누락!!)'}")
print(f"[시작] TELEGRAM_TOKEN 설정: {'O' if TELEGRAM_TOKEN else 'X (누락!!)'}")
print(f"[시작] TELEGRAM_CHAT_ID: {TELEGRAM_CHAT_ID if TELEGRAM_CHAT_ID else 'X (누락!!)'}")

if not GOCAMPING_API_KEY or not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
    print("[오류] 필요한 환경변수가 누락되었습니다. GitHub Secrets를 확인하세요.")

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
        response = requests.get(url, params=params, timeout=(5, 15))
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
        response = requests.get(res_url, headers=headers, timeout=(5, 10))
        
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
        f"⛺ <b>[캠핑장 발견!]</b>\n"
        f"이름: {camp_info['name']}\n"
        f"위치: {camp_info['addr']}\n"
        f"이동시간: {camp_info['dist_info']}\n"
        f"\n지금 바로 비어있는지 폰으로 확인해보세요!"
    )
    api_url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"

    # 인라인 키보드
    reply_markup = {
        "inline_keyboard": [
            [
                {"text": "🏕️ 예약하기로 가기", "url": camp_info['res_url'] if camp_info['res_url'] else f"https://m.search.naver.com/search.naver?query={camp_info['name']}"},
            ]
        ]
    }

    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "HTML",
        "reply_markup": json.dumps(reply_markup)
    }

    try:
        print(f"[텔레그램] 전송 시도 → chat_id={TELEGRAM_CHAT_ID}, 캠핑장={camp_info['name']}")
        resp = requests.post(api_url, json=payload, timeout=15)
        result = resp.json()
        if result.get('ok'):
            print(f"[텔레그램] ✅ 전송 성공!")
        else:
            print(f"[텔레그램] ❌ 전송 실패! 응답: {result}")
            # Chat ID가 잘못됐을 경우 getUpdates로 올바른 ID 출력
            if result.get('error_code') == 400:
                updates_url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/getUpdates"
                upd = requests.get(updates_url, timeout=10).json()
                messages = upd.get('result', [])
                if messages:
                    print("[힌트] 봇에게 메시지를 보낸 채팅 목록:")
                    for m in messages[-5:]:
                        ch = m.get('message', {}).get('chat', {})
                        print(f"  → chat_id={ch.get('id')}, type={ch.get('type')}, name={ch.get('first_name','')}{ch.get('title','')}")
                else:
                    print("[힌트] 봇에게 메시지한 기록이 없습니다. 먼저 텔레그램에서 봇에게 /start 를 보내주세요.")
    except Exception as e:
        print(f"[텔레그램] ❌ 전송 중 예외 발생: {e}")

# ==========================================
# 메인 실행 로직
# ==========================================
def main():
    print("시스템 가동 중...")
    
    # 1. 앱에서 설정한 현재 상태(Google Sheets API) 불러오기
    settings = get_settings()
    if settings:
        is_on = settings.get('isOn', True)
        interval_mins = settings.get('intervalMins', 10)
        target_camp = settings.get('targetCampUrl', '')
        last_run_str = settings.get('lastRunTime', '')
        
        # 앱에서 토글로 끈 경우 즉시 파이썬 동작 정지
        if not is_on:
            print("앱에서 [자동 알림]이 비활성화 되어 있습니다. 스크래핑을 스킵하고 종료합니다.")
            return
            
        # 가상 스케줄링 로직 (GitHub의 강제 주기 사이사이에 시간차단기 작동)
        if last_run_str:
            try:
                last_run_time = datetime.fromisoformat(last_run_str.replace('Z', '+00:00'))
                now = datetime.now(timezone.utc)
                diff_mins = (now - last_run_time).total_seconds() / 60
                
                # GitHub Actions 크론잡의 지연 시간을 고려하여 -2분 마진 부여
                if diff_mins < (interval_mins - 2):
                    print(f"아직 사용자 설정 실행 주기가 되지 않았습니다 (설정: {interval_mins}분 / 현재 경과: {diff_mins:.1f}분).")
                    return
            except Exception as e:
                print(f"가상 스케줄링 타임라인 검증 오류: {e}")
    else:
        print("경고: 설정(API)을 가져오지 못해 기본 모드로 동작합니다.")
        target_camp = ''
        
    # 시간이 다 되어서 넘어온 경우, 즉시 마지막 실행 시간을 구글에 업데이트
    update_last_run_time()

    campgrounds = []
    
    # 2. 타겟팅 다중 모드 확인
    if target_camp:
        try:
            # JSON 배열 파싱 시도
            targets = json.loads(target_camp)
            if isinstance(targets, list) and len(targets) > 0:
                print(f"🎯 [다중 타겟팅 모드 작동 중] 총 {len(targets)}개의 대상을 감시합니다.")
                for t in targets:
                    if isinstance(t, dict):
                        campgrounds.append({
                            'name': t.get('name', '이름 없음'),
                            'addr': '앱에서 다중 지정된 찜 캠핑장',
                            'res_url': t.get('url', ''),
                            'dist_info': '확인 불필요 (지정됨)'
                        })
        except Exception:
            # JSON 파싱 실패시 하위 호환
            if "|||" in target_camp:
                name, res_url = target_camp.split("|||", 1)
                print(f"🎯 [구버전 단일 타겟팅 작동 중] 대상: {name}")
                campgrounds.append({
                    'name': name,
                    'addr': '앱에서 지정된 단독 캠핑장',
                    'res_url': res_url,
                    'dist_info': '확인 불필요 (단일 지정)'
                })

    is_targeted_mode = bool(campgrounds)  # True면 앱에서 지정한 타겟 모드

    if not campgrounds:
        # 일반 광역 필터링 모드
        campgrounds = get_filtered_campgrounds()
        print(f"조건에 맞는 캠핑장 {len(campgrounds)}개 발견.")

    # 3. 알림 전송 로직
    for camp in campgrounds:
        if is_targeted_mode:
            # 앱에서 직접 지정한 캠핑장은 스크래핑 결과와 무관하게 무조건 알림 전송
            # (예약 사이트들이 봇을 막기 때문에 스크래핑 결과는 신뢰 불가)
            avail = check_reservation_status(camp['res_url'])
            status_text = "확인 요망 (자동 감지 불가)" if not avail else "잔여석 감지됨!"
            camp['dist_info'] = f"{camp['dist_info']} | 상태: {status_text}"
            print(f"[타겟 알림] {camp['name']} → 전송 (스크래핑 결과: {'가능' if avail else '불가/차단'})")
            send_telegram_msg(camp)
        else:
            # 일반 모드: 스크래핑 성공 시에만 전송
            if check_reservation_status(camp['res_url']):
                print(f"[일반 알림] {camp['name']} → 전송")
                send_telegram_msg(camp)
        time.sleep(1)


if __name__ == "__main__":
    main()
