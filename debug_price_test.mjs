
import axios from 'axios';

const API_KEY = 'a08bef2ae4cba753bb366a281c813e030a9ec6978b6c130cb19a01165c63d66f';

const extractPrice = (i) => {
    const content = [
      i.intro, i.featureNm, i.posblFcltyCl, i.sbrsCl, i.exprnProgrm, i.lineIntro, i.facltNm, i.addr1
    ].filter(Boolean).join(' ');
    
    const priceRegex = /(\d{1,3}(?:,\d{3})*|\d{4,7})\s*(?:원|만원|원~|원-)/g;
    let match; 
    const prices = [];
    
    while ((match = priceRegex.exec(content)) !== null) {
      let val = 0;
      const numPart = match[1];
      if (!numPart) continue;
      
      const rawMatch = match[0];
      if (rawMatch.includes('만원')) {
        const num = parseInt(rawMatch.replace(/[^\d]/g, ''));
        if (num < 100) val = num * 10000;
      } else {
        val = parseInt(rawMatch.replace(/[^\d]/g, ''));
      }
      
      if (val >= 10000 && val <= 1000000) { 
        prices.push(val);
      }
    }
    
    if (prices.length) {
      const standard = prices.filter(v => v >= 30000 && v <= 80000);
      if (standard.length) return Math.min(...standard);
      return Math.min(...prices);
    }
    return null;
};

async function debug() {
  const url = `https://apis.data.go.kr/B551011/GoCamping/basedList?serviceKey=${API_KEY}&numOfRows=4000&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json`;
  try {
    const res = await axios.get(url);
    const items = res.data.response.body.items.item;
    const target = items.find(i => i.facltNm.includes('대신 오토'));
    
    if (target) {
        const price = extractPrice(target);
        console.log("--- 대신 오토 캠핑장 가격 추출 결과 ---");
        console.log("Extracted Price:", price);
        
        const content = [
          target.intro, target.featureNm, target.posblFcltyCl, target.sbrsCl, target.lineIntro
        ].filter(Boolean).join(' ');
        console.log("Content search targets:", content);
    }
  } catch (e) {
    console.error(e.message);
  }
}

debug();
