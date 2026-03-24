import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Proxy Route for GoCamping
  app.get("/api/camping", async (req, res) => {
    const { serviceKey, numOfRows, pageNo } = req.query;
    
    if (!serviceKey) {
      return res.status(400).json({ error: "Service Key is required" });
    }

    try {
      const url = `https://apis.data.go.kr/B551011/GoCamping/basedList`;
      
      // Some keys are already encoded, some are not. 
      // We'll pass it as a param to axios which handles standard encoding.
      const response = await axios.get(url, {
        params: {
          serviceKey: serviceKey, // Axios will handle encoding
          numOfRows: numOfRows || 10,
          pageNo: pageNo || 1,
          MobileOS: "ETC",
          MobileApp: "CampingBot",
          _type: "json"
        }
      });
      
      // Check if the response is actually an error wrapped in XML (common in GoCamping API)
      if (typeof response.data === 'string' && response.data.includes('<cmmMsgHeader>')) {
        if (response.data.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR')) {
          return res.status(401).json({ error: "Service Key not registered yet", apiData: response.data });
        }
        return res.status(401).json({ error: "API Authorization Failed", apiData: response.data });
      }

      res.json(response.data);
    } catch (error: any) {
      console.error("API Proxy Error:", error.message);
      const status = error.response?.status || 500;
      const data = error.response?.data || "No response data";
      res.status(status).json({ 
        error: "Failed to fetch data from GoCamping API", 
        details: error.message,
        apiStatus: status,
        apiData: data
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
