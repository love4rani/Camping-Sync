import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GOCAMPING_API_KEY;
const URL = "https://apis.data.go.kr/B551011/GoCamping/basedList";

async function fetchAll() {
  console.log("Fetching GoCamping full list (up to 4000 items)...");
  if (!API_KEY) {
    console.error("Error: GOCAMPING_API_KEY is missing in .env");
    return;
  }

  try {
    const res = await axios.get(URL, {
      params: {
        serviceKey: API_KEY,
        numOfRows: 4000,
        pageNo: 1,
        MobileOS: "ETC",
        MobileApp: "CampingSync",
        _type: "json"
      }
    });

    if (!res.data?.response?.body?.items?.item) {
        console.error("Error: Invalid API response. Check your API key.");
        console.log("Response data:", JSON.stringify(res.data, null, 2));
        return;
    }

    const items = res.data.response.body.items.item;
    console.log(`Successfully fetched ${items.length} items from GoCamping API.`);

    const mapped = items.map(i => ({
      id: i.contentId,
      nm: i.facltNm,
      addr: i.addr1,
      lat: parseFloat(i.mapY || 0),
      lng: parseFloat(i.mapX || 0),
      do: i.doNm,
      sigungu: i.sigunguNm,
      type: i.induty || "",
      env: i.lctCl || "",
      fac: i.sbrsCl || "",
      img: i.firstImageUrl || "",
      resve: i.resveUrl || "",
      price: null,
      stone: (i.sbrsCl || '').includes('파쇄석'),
      parking: (i.sbrsCl || '').includes('사이트옆주차'),
      camfit: (i.resveUrl || '').includes('camfit')
    }));

    const output = {
      version: new Date().toISOString().split('T')[0],
      items: mapped
    };

    fs.writeFileSync('./public/camping-db.json', JSON.stringify(output, null, 2));
    console.log("Database updated: ./public/camping-db.json");
    
    // Also update dist for build parity
    if (fs.existsSync('./dist')) {
        fs.writeFileSync('./dist/camping-db.json', JSON.stringify(output, null, 2));
        console.log("Database updated: ./dist/camping-db.json");
    }

  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

fetchAll();
