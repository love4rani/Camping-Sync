
import axios from 'axios';

const API_KEY = 'a08bef2ae4cba753bb366a281c813e030a9ec6978b6c130cb19a01165c63d66f';

async function debug() {
  const url = `https://apis.data.go.kr/B551011/GoCamping/basedList?serviceKey=${API_KEY}&numOfRows=4000&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json`;
  try {
    const res = await axios.get(url);
    const items = res.data.response.body.items.item;
    const targets = items.filter(i => i.facltNm.includes('대신 웰빙') || i.facltNm.includes('대신 오토'));
    
    targets.forEach(i => {
      console.log(`\n--- [${i.facltNm}] ---`);
      console.log("induty:", i.induty);
      console.log("siteBottomCl1~5:", [i.siteBottomCl1, i.siteBottomCl2, i.siteBottomCl3, i.siteBottomCl4, i.siteBottomCl5].join(','));
      console.log("featureNm:", i.featureNm);
      console.log("intro:", i.intro ? i.intro.substring(0, 100) : null);
      console.log("sbrsCl:", i.sbrsCl);
    });
  } catch (e) {
    console.error(e.message);
  }
}

debug();
