
import axios from 'axios';

const API_KEY = 'a08bef2ae4cba753bb366a281c813e030a9ec6978b6c130cb19a01165c63d66f';

async function debug() {
  const url = `https://apis.data.go.kr/B551011/GoCamping/basedList?serviceKey=${API_KEY}&numOfRows=4000&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json`;
  try {
    const res = await axios.get(url);
    const items = res.data.response.body.items.item;
    const target = items.find(i => i.facltNm.includes('대신 오토'));
    
    if (target) {
        const content = [
          target.facltNm, target.addr1, target.intro, target.featureNm, target.lctCl, target.sbrsCl, 
          target.posblFcltyCl, target.induty, target.lineIntro, target.exprnProgrm
        ].filter(Boolean).join(' ');
        
        console.log("--- FULL CONTENT ---");
        console.log(content);
        console.log("\n--- KEYWORD CHECKS ---");
        console.log("has '파쇄석':", content.includes('파쇄석'));
        console.log("has '마사토':", content.includes('마사토'));
        console.log("has '옆' (parking):", content.includes('옆'));
        console.log("has '주차' (parking):", content.includes('주차'));
    }
  } catch (e) {
    console.error(e.message);
  }
}

debug();
