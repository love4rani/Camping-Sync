import requests, os
from dotenv import load_dotenv
load_dotenv()

token = os.getenv("TELEGRAM_TOKEN", "")
chat_id = os.getenv("TELEGRAM_CHAT_ID", "")

print(f"Token OK: {bool(token)}")
print(f"Chat ID in .env: {chat_id}")

# 1. getUpdates로 실제 chat_id 확인
try:
    url = f"https://api.telegram.org/bot{token}/getUpdates"
    r = requests.get(url, timeout=(5, 10))
    data = r.json()
    results = data.get("result", [])
    if results:
        print("\n[봇에게 메시지 보낸 채팅 목록]")
        seen = set()
        for m in results:
            ch = m.get("message", {}).get("chat", {})
            cid = ch.get("id")
            if cid and cid not in seen:
                seen.add(cid)
                print(f"  chat_id={cid}, type={ch.get('type')}, name={ch.get('first_name','')}{ch.get('title','')}")
    else:
        print("\n[!] getUpdates 결과 없음 → 텔레그램 봇에게 /start 를 먼저 보내주세요!")
except Exception as e:
    print(f"getUpdates 실패: {e}")

# 2. 직접 테스트 메시지 전송
try:
    url2 = f"https://api.telegram.org/bot{token}/sendMessage"
    r2 = requests.post(url2, json={"chat_id": chat_id, "text": "[Camping-Sync] ⛺ 텔레그램 연결 테스트!"}, timeout=(5, 10))
    result = r2.json()
    if result.get("ok"):
        print("\n[SUCCESS] 테스트 메시지 전송 성공!")
    else:
        print(f"\n[FAIL] 전송 실패: {result}")
except Exception as e:
    print(f"sendMessage 실패: {e}")
