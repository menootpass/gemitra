// Google Apps Script untuk API Feedback
// Mendukung operasi CRUD lengkap untuk feedback

// Konfigurasi
const SPREADSHEET_ID = '1KeDQC7cUBsn23K2n1gRP25MJ3844pRiVn67RU06vUdc'; // Ganti dengan ID spreadsheet Anda
const SHEET_NAME = 'Feedback'; // Nama sheet

// Fungsi utama untuk menangani semua request
function doPost(e) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  try {
    // Log incoming request untuk debugging
    console.log('doPost called with:', e.postData.contents);
    
    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'create';
    let result;
    
    switch(action) {
      case 'create':
        result = createFeedback(data);
        break;
      case 'update':
        result = updateFeedback(data);
        break;
      case 'delete':
        result = deleteFeedback(data);
        break;
      default:
        result = createFeedback(data);
    }
    
    var output = ContentService.createTextOutput(JSON.stringify(result));
    output.setMimeType(ContentService.MimeType.JSON);
    output.setHeaders(headers);
    return output;
  } catch (error) {
    console.error('Error in doPost:', error);
    var output = ContentService.createTextOutput(JSON.stringify({ 
      error: error.toString(),
      message: 'Terjadi kesalahan pada server'
    }));
    output.setMimeType(ContentService.MimeType.JSON);
    output.setHeaders(headers);
    return output;
  }
}

// Fungsi untuk menangani PUT request (update)
function doPut(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  try {
    const data = JSON.parse(e.postData.contents);
    const result = updateFeedback(data);
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

// Fungsi untuk menangani DELETE request
function doDelete(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  try {
    const id = Number(e.parameter.id);
    const result = deleteFeedback({ id });
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

// Fungsi untuk membaca semua data (GET)
function doGet(e) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  try {
    console.log('doGet called');
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const headers_data = data[0];
    const rows = data.slice(1);
    
    const feedbacks = rows.map((row, index) => {
      const feedback = {};
      headers_data.forEach((header, i) => {
        feedback[header] = row[i];
      });
      return feedback;
    });
    
    var output = ContentService.createTextOutput(JSON.stringify({ 
      success: true,
      data: feedbacks 
    }));
    output.setMimeType(ContentService.MimeType.JSON);
    output.setHeaders(headers);
    return output;
  } catch (error) {
    console.error('Error in doGet:', error);
    var output = ContentService.createTextOutput(JSON.stringify({ 
      error: error.toString(),
      message: 'Terjadi kesalahan saat mengambil data'
    }));
    output.setMimeType(ContentService.MimeType.JSON);
    output.setHeaders(headers);
    return output;
  }
}

// Fungsi untuk membuat feedback baru
function createFeedback(data) {
  try {
    console.log('Apps Script - Data feedback yang diterima:', JSON.stringify(data, null, 2));
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    // Generate ID baru (auto increment)
    const lastRow = sheet.getLastRow();
    const newId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1;
    
    // Siapkan data untuk insert
    const newData = [
      newId,
      data.nama || '',
      data.email || '',
      data.telepon || '',
      data.kategori || '',
      data.rating || 0,
      data.pesan || '',
      data.status || 'pending',
      new Date().toISOString(), // timestamp
    ];
    
    // Insert data baru
    sheet.appendRow(newData);
    console.log('Apps Script - Data feedback yang disimpan:', JSON.stringify(newData, null, 2));
    
    return { 
      success: true, 
      message: 'Feedback berhasil dikirim',
      id: newId
    };
  } catch (error) {
    console.error('Error in createFeedback:', error);
    return { 
      error: error.toString(),
      message: 'Gagal menyimpan feedback'
    };
  }
}

// Fungsi untuk mengupdate feedback
function updateFeedback(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const dataRange = sheet.getDataRange().getValues();
    
    // Cari row berdasarkan ID
    let rowIndex = -1;
    for (let i = 1; i < dataRange.length; i++) {
      if (dataRange[i][0] == data.id) {
        rowIndex = i + 1; // +1 karena sheet dimulai dari 1
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { error: 'Feedback tidak ditemukan' };
    }
    
    // Update data
    const updateData = [
      data.id,
      data.nama || '',
      data.email || '',
      data.telepon || '',
      data.kategori || '',
      data.rating || 0,
      data.pesan || '',
      data.status || 'pending',
      data.timestamp || new Date().toISOString(),
    ];
    
    // Update row
    const range = sheet.getRange(rowIndex, 1, 1, updateData.length);
    range.setValues([updateData]);
    
    return { 
      success: true, 
      message: 'Feedback berhasil diperbarui' 
    };
  } catch (error) {
    console.error('Error in updateFeedback:', error);
    return { 
      error: error.toString(),
      message: 'Gagal mengupdate feedback'
    };
  }
}

// Fungsi untuk menghapus feedback
function deleteFeedback(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const dataRange = sheet.getDataRange().getValues();
    
    // Cari row berdasarkan ID
    let rowIndex = -1;
    for (let i = 1; i < dataRange.length; i++) {
      if (dataRange[i][0] == data.id) {
        rowIndex = i + 1; // +1 karena sheet dimulai dari 1
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { error: 'Feedback tidak ditemukan' };
    }
    
    // Hapus row
    sheet.deleteRow(rowIndex);
    
    return { 
      success: true, 
      message: 'Feedback berhasil dihapus' 
    };
  } catch (error) {
    console.error('Error in deleteFeedback:', error);
    return { 
      error: error.toString(),
      message: 'Gagal menghapus feedback'
    };
  }
}

// Fungsi untuk setup spreadsheet (jalankan sekali)
function setupFeedbackSpreadsheet() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    // Set header jika sheet kosong
    if (sheet.getLastRow() === 0) {
      const headers = [
        'id',
        'nama', 
        'email',
        'telepon',
        'kategori',
        'rating',
        'pesan',
        'status',
        'timestamp',
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    console.log('Spreadsheet Feedback berhasil disetup!');
    return { success: true, message: 'Setup berhasil' };
  } catch (error) {
    console.error('Error setup feedback spreadsheet:', error);
    return { error: error.toString(), message: 'Gagal setup spreadsheet' };
  }
}
