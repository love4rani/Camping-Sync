import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { Octokit } from '@octokit/rest';
import VersionManager from './lib/version-manager.js';

dotenv.config();

const app = express();
const PORT = 3001;
const DB_PATH = path.resolve('public/camping-db.json');
const vm = new VersionManager({ baseDir: path.resolve('public/backups') });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Root route to confirm API is running
app.get('/', (req, res) => {
  res.send(`
    <h1>Camping-Sync API is Running</h1>
    <p>This is the DATA server on <b>Port 3001</b>.</p>
    <p>To use the Management Tool, please open: 
       <a href="http://localhost:3002/index_db.html">http://localhost:3002/index_db.html</a>
    </p>
  `);
});

// 1. Get DB File
app.get('/api/db', (req, res) => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'DB file not found' });
  }
});

// 2. Save DB File (Local)
app.post('/api/db/save', (req, res) => {
  try {
    const data = req.body;
    const version = data.version || 'unknown';
    
    // 1. 기존 파일 백업 (저장 전 상태 보존)
    if (fs.existsSync(DB_PATH)) {
      vm.createBackup(DB_PATH, version, req.body.message || '수동 저장');
    }
    
    // 2. 새 데이터 저장
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    
    // 3. dist 백업 (있을 경우)
    if (fs.existsSync('dist')) {
      fs.writeFileSync('dist/camping-db.json', JSON.stringify(data, null, 2));
    }
    
    res.json({ success: true, version });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save DB: ' + err.message });
  }
});

// 3. Fetch from GoCamping API
app.get('/api/gocamping/fetch', async (req, res) => {
  const API_KEY = process.env.GOCAMPING_API_KEY;
  if (!API_KEY) return res.status(400).json({ error: 'API Key missing' });

  try {
    const response = await axios.get('http://apis.data.go.kr/B551011/GoCamping/basedList', {
      params: {
        serviceKey: API_KEY,
        numOfRows: 4000,
        pageNo: 1,
        MobileOS: "ETC",
        MobileApp: "CampingSyncTool",
        _type: "json"
      }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'API fetch failed' });
  }
});

// 4. Publish to GitHub
app.post('/api/github/publish', async (req, res) => {
  const { owner, repo, path: filePath, content, message, token } = req.body;
  const PAT = token || process.env.GITHUB_PAT; // 프론트엔드에서 전달된 토큰 우선 사용
  if (!PAT) return res.status(400).json({ error: 'GitHub PAT missing' });

  const octokit = new Octokit({ auth: PAT });

  try {
    // Get current file sha (needed for update)
    let sha;
    try {
      const { data } = await octokit.repos.getContent({ owner, repo, path: filePath });
      if (!Array.isArray(data)) sha = data.sha;
    } catch (e) { /* File might not exist */ }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message,
      content: Buffer.from(content).toString('base64'),
      sha
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Local History (Backups)
app.get('/api/db/history', (req, res) => {
  res.json(vm.getHistory());
});

// 6. Restore Local Backup
app.post('/api/db/restore/:fileName', (req, res) => {
  const result = vm.restore(req.params.fileName, DB_PATH);
  if (result.success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: result.error });
  }
});

// 7. GitHub 히스토리 조회 (커밋 내역)
app.get('/api/github/history', async (req, res) => {
  const { owner, repo, path: filePath, token } = req.query;
  const PAT = (token && token !== 'undefined') ? token : process.env.GITHUB_PAT;
  if (!PAT) return res.status(400).json({ error: 'GitHub PAT 미설정' });

  const octokit = new Octokit({ auth: PAT });

  try {
    // 지정된 경로의 커밋 내역 최근 20개 조회
    const { data } = await octokit.repos.listCommits({
      owner: owner,
      repo: repo,
      path: filePath,
      per_page: 20
    });
    
    const history = data.map(c => ({
      sha: c.sha, // 커밋 고유 ID
      message: c.commit.message, // 커밋 메시지
      author: c.commit.author?.name, // 작성자
      date: c.commit.author?.date, // 날짜
      url: c.html_url // GitHub 상세 링크
    }));
    
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'GitHub 이력 조회 실패: ' + err.message });
  }
});

/**
 * 8. GitHub 온라인 데이터로 로컬 복구 (GitHub Restore/Rollback)
 * 특정 SHA 시점의 파일을 GitHub에서 가져와 로컬 DB를 교체합니다.
 */
app.post('/api/github/restore', async (req, res) => {
  const { owner, repo, path: filePath, sha, token, version } = req.body;
  const PAT = token || process.env.GITHUB_PAT;
  if (!PAT) return res.status(400).json({ error: 'GitHub PAT 미설정' });

  const octokit = new Octokit({ auth: PAT });

  try {
    // [보안] 복구 전 현재 상태를 로컬 백업 폴더에 자동 저장 (Safety First)
    if (fs.existsSync(DB_PATH)) {
      vm.createBackup(DB_PATH, version || 'Pre-Restore', 'GitHub 복구 전 자동 백업');
    }

    // GitHub에서 특정 SHA 시점의 파일 내용 가져오기
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: sha // 특정 커밋 시점 지정
    });

    if (Array.isArray(data)) throw new Error('파일 경로가 디렉토리입니다.');
    
    // base64 디코딩하여 실제 JSON 텍스트 추출
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    
    // 로컬 파일 교체 및 dist 반영
    fs.writeFileSync(DB_PATH, content);
    if (fs.existsSync('dist')) {
      fs.writeFileSync('dist/camping-db.json', content);
    }

    res.json({ success: true, message: `${sha.slice(0, 7)} 시점의 데이터로 복구되었습니다.` });
  } catch (err) {
    res.status(500).json({ error: 'GitHub 데이터 복구 실패: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[서버] DB API가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
