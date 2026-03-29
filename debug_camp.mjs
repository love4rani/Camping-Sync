
import axios from 'axios';

const API_KEY = 'a08bef2ae4cba753bb366a281c813e030a9ec6978b6c130cb19a01165c63d66f';

async function debug() {
  const url = `https://apis.data.go.kr/B551011/GoCamping/basedList?serviceKey=${API_KEY}&numOfRows=4000&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json`;
  console.log("Fetching data with axios...");
  try {
    const res = await axios.get(url);
    const items = res.data.response.body.items.item;
    
    const target = items.find(i => i.facltNm.includes('대신 오토'));
    const comparison = items.find(i => i.facltNm.includes('대신 웰빙'));
    
    console.log("\n--- [1] 대신 오토 캠핑장 ---");
    if (!target) {
        console.log("NOT FOUND in API!");
    } else {
        console.log("Item Details:");
        console.log("- addr1:", target.addr1);
        console.log("- induty:", target.induty);
        console.log("- siteBottomCl1(잔디):", target.siteBottomCl1);
        console.log("- siteBottomCl2(파쇄석):", target.siteBottomCl2);
        console.log("- siteBottomCl3(테크):", target.siteBottomCl3);
        console.log("- siteBottomCl4(자갈):", target.siteBottomCl4);
        console.log("- siteBottomCl5(흙):", target.siteBottomCl5);
        console.log("- intro:", target.intro ? target.intro.substring(0, 50) + "..." : "null");
        console.log("- featureNm:", target.featureNm ? target.featureNm.substring(0, 50) + "..." : "null");
        console.log("- sbrsCl(부대시설):", target.sbrsCl);
        console.log("- posblFcltyCl(가능시설):", target.posblFcltyCl);
    }
    
    console.log("\n--- [2] 대신 웰빙 캠핑장 ---");
    if (!comparison) {
        console.log("NOT FOUND in API!");
    } else {
        console.log("Item Details:");
        console.log("- addr1:", comparison.addr1);
        console.log("- induty:", comparison.induty);
        console.log("- siteBottomCl2(파쇄석):", comparison.siteBottomCl2);
        console.log("- siteBottomCl5(흙):", comparison.siteBottomCl5);
        console.log("- intro:", comparison.intro ? comparison.intro.substring(0, 50) + "..." : "null");
        console.log("- sbrsCl:", comparison.sbrsCl);
    }
  } catch (e) {
    console.error("Fetch failed:", e.message);
  }
}

debug();
