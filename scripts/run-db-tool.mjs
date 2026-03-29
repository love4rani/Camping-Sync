import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('--- Starting Camping-Sync DB Management Tool ---');

// 1. Start API Server
const api = spawn('node', ['server/db-api.js'], { 
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true 
});

// 2. Start Vite UI on port 3002
const vite = spawn('npx', ['vite', '--port', '3002'], { 
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true 
});

// Allow some time for servers to start before notifying
setTimeout(() => {
  console.log('\n======================================================');
  echoToolInfo();
  console.log('======================================================\n');
}, 2000);

function echoToolInfo() {
  console.log('🚀 UI Running at:  http://localhost:3002/index_db.html');
  console.log('📡 API Running at: http://localhost:3001');
}

// Handle cleanup
process.on('SIGINT', () => {
  api.kill();
  vite.kill();
  process.exit();
});

api.on('exit', (code) => {
  if (code !== 0) console.error(`API Server exited with code ${code}`);
});

vite.on('exit', (code) => {
  if (code !== 0) console.error(`Vite UI exited with code ${code}`);
});
