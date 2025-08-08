function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === "track_visitor") {
      return trackVisitor();
    }
    // Tambahkan handler lain jika perlu
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function trackVisitor() {
  var ss = SpreadsheetApp.openById('1KeDQC7cUBsn23K2n1gRP25MJ3844pRiVn67RU06vUdc');
  var sheet = ss.getSheetByName('Visitors');
  if (!sheet) {
    sheet = ss.insertSheet('Visitors');
    sheet.appendRow(['Timestamp', 'User', 'Info']);
  }
  var now = new Date();
  var user = Session.getActiveUser().getEmail() || 'anonymous';
  var info = getUserIp();
  sheet.appendRow([now, user, info]);
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getUserIp() {
  // Google Apps Script tidak bisa dapat IP asli user, jadi bisa diisi 'unknown' atau info lain
  return 'unknown';
}
