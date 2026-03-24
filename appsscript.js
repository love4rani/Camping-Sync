const SHEET_NAME = 'Settings';

// 시트 가져오기 (없으면 생성)
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

// 초기화: 첫 번째 줄(Header)과 두 번째 줄(Data) 초기화
function initSheet() {
  const sheet = getSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['isOn', 'intervalMins', 'targetCampUrl', 'lastRunTime']);
    sheet.appendRow(['true', 10, '', new Date().toISOString()]);
  }
}

// GET 요청: Python 봇이 설정값을 읽어갈 때 사용
function doGet(e) {
  initSheet();
  const sheet = getSheet();
  const data = sheet.getRange("A2:D2").getValues()[0];
  
  const result = {
    isOn: data[0] === 'true' || data[0] === true,
    intervalMins: Number(data[1]),
    targetCampUrl: data[2],
    lastRunTime: data[3]
  };
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// POST 요청: React 앱이나 Python 봇이 설정값을 수정할 때 사용
function doPost(e) {
  initSheet();
  const sheet = getSheet();
  
  try {
    // text/plain 으로 넘긴 JSON 텍스트 파싱
    const body = JSON.parse(e.postData.contents);
    const currentData = sheet.getRange("A2:D2").getValues()[0];
    
    const isOn = body.hasOwnProperty('isOn') ? body.isOn.toString() : currentData[0];
    const intervalMins = body.hasOwnProperty('intervalMins') ? body.intervalMins : currentData[1];
    const targetCampUrl = body.hasOwnProperty('targetCampUrl') ? body.targetCampUrl : currentData[2];
    const lastRunTime = body.hasOwnProperty('lastRunTime') ? body.lastRunTime : currentData[3];
    
    // 두 번째 줄 데이터 덮어쓰기
    sheet.getRange("A2:D2").setValues([[isOn, intervalMins, targetCampUrl, lastRunTime]]);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
