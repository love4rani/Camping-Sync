export const extractLatLng = (input: string, showToast: (msg: string, type: 'error' | 'success' | 'info') => void): { lat: number; lng: number } | null => {
  if (!input) return null;
  
  // Check for short URLs (maps.app.goo.gl)
  if (input.includes('goo.gl')) {
    showToast('단축 주소는 인식 불가합니다. 위의 가이드(1번)를 확인하세요.', 'error');
    return null;
  }

  // 1. Raw Lat,Lng match (e.g. 37.123, 127.123)
  const rawMatch = input.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (rawMatch) {
    return { lat: parseFloat(rawMatch[1]), lng: parseFloat(rawMatch[2]) };
  }

  // 2. URL match (Standard/Long URL)
  const urlMatch = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (urlMatch) {
    return { lat: parseFloat(urlMatch[1]), lng: parseFloat(urlMatch[2]) };
  }
  
  // 3. Google Maps URL patterns (fallback)
  const m2 = input.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (m2) return { lat: parseFloat(m2[1]), lng: parseFloat(m2[2]) };
  const m3 = input.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m3) return { lat: parseFloat(m3[1]), lng: parseFloat(m3[2]) };
  
  return null;
};
