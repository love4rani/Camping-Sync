import fs from 'fs';
import path from 'path';

/**
 * 범용 버전 관리 매니저 (Universal Version Manager)
 * 프로젝트의 데이터 파일을 백업하고 히스토리를 관리합니다.
 */
class VersionManager {
  constructor(options = {}) {
    this.baseDir = options.baseDir || path.resolve('public/backups');
    this.historyFile = path.join(this.baseDir, 'history.json');
    this.init();
  }

  init() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
    if (!fs.existsSync(this.historyFile)) {
      fs.writeFileSync(this.historyFile, JSON.stringify([], null, 2));
    }
  }

  /**
   * 새로운 로컬 백업을 생성하고 이력을 기록합니다.
   */
  createBackup(sourcePath, version, message = '자동 백업') {
    try {
      if (!fs.existsSync(sourcePath)) return { success: false, error: 'Source file not found' };

      const ext = path.extname(sourcePath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `backup_${version.replace(/[: ]/g, '_')}_${timestamp}${ext}`;
      const destPath = path.join(this.baseDir, fileName);

      // 파일 복사
      fs.copyFileSync(sourcePath, destPath);

      // 히스토리 추가
      const history = JSON.parse(fs.readFileSync(this.historyFile, 'utf-8'));
      const newEntry = {
        id: Date.now().toString(),
        version,
        fileName,
        message,
        timestamp: new Date().toISOString(),
        type: 'LOCAL'
      };
      
      history.unshift(newEntry);
      fs.writeFileSync(this.historyFile, JSON.stringify(history.slice(0, 50), null, 2)); // 최근 50개 유지

      return { success: true, entry: newEntry };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * 로컬 백업 리스트를 반환합니다.
   */
  getHistory() {
    try {
      return JSON.parse(fs.readFileSync(this.historyFile, 'utf-8'));
    } catch (err) {
      return [];
    }
  }

  /**
   * 특정 백업 파일로 복원합니다.
   */
  restore(fileName, targetPath) {
    try {
      const sourcePath = path.join(this.baseDir, fileName);
      if (!fs.existsSync(sourcePath)) return { success: false, error: 'Backup file not found' };
      
      fs.copyFileSync(sourcePath, targetPath);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

export default VersionManager;
