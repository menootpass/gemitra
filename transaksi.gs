// Google Apps Script untuk API Transaksi
// File: transaksi.gs

// =================== KONFIGURASI ===================
const TRANSAKSI_SPREADSHEET_ID = '1KeDQC7cUBsn23K2n1gRP25MJ3844pRiVn67RU06vUdc';
const TRANSAKSI_SHEET_NAME = 'Transaksi';

// =================== ENDPOINT UTAMA ===================

/**
 * Menangani request GET untuk membaca data transaksi.
 * @param {object} e - Event parameter dari request.
 * @returns {ContentService.TextOutput} - Response JSON.
 */
function doGet(e) {
  try {
    // Cek apakah ada parameter action
    if (e.parameter.action === 'get-transaction') {
      return getTransactionByKode(e.parameter.kode);
    }
    
    // Default: ambil semua transaksi
    const sheet = SpreadsheetApp.openById(TRANSAKSI_SPREADSHEET_ID).getSheetByName(TRANSAKSI_SHEET_NAME);
    const dataRange = sheet.getDataRange().getValues();
    const headers = dataRange[0];
    const rows = dataRange.slice(1);
    
    const transactions = rows.map(row => {
      const transaction = {};
      headers.forEach((header, i) => {
        transaction[header] = row[i];
      });
      return transaction;
    });
    
    const response = { success: true, data: transactions };
    return createJsonResponse(response);

  } catch (error) {
    const errorResponse = { success: false, error: error.toString() };
    return createJsonResponse(errorResponse, 500);
  }
}

/**
 * Mengambil data transaksi berdasarkan kode.
 * @param {string} kode - Kode transaksi yang dicari.
 * @returns {ContentService.TextOutput} - Response JSON.
 */
function getTransactionByKode(kode) {
  try {
    if (!kode) {
      return createJsonResponse({ 
        success: false, 
        message: 'Parameter kode diperlukan' 
      }, 400);
    }
    
    const sheet = SpreadsheetApp.openById(TRANSAKSI_SPREADSHEET_ID).getSheetByName(TRANSAKSI_SHEET_NAME);
    const dataRange = sheet.getDataRange().getValues();
    const headers = dataRange[0];
    const rows = dataRange.slice(1);
    
    // Cari transaksi berdasarkan kode
    let foundTransaction = null;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const kodeIndex = headers.indexOf('kode');
      
      if (kodeIndex !== -1 && row[kodeIndex] === kode) {
        // Buat objek transaksi
        foundTransaction = {};
        headers.forEach((header, j) => {
          foundTransaction[header] = row[j];
        });
        break;
      }
    }
    
    if (foundTransaction) {
      const response = { 
        success: true, 
        data: foundTransaction,
        message: 'Transaksi ditemukan'
      };
      return createJsonResponse(response);
    } else {
      const response = { 
        success: false, 
        message: `Transaksi dengan kode '${kode}' tidak ditemukan` 
      };
      return createJsonResponse(response, 404);
    }
    
  } catch (error) {
    const errorResponse = { 
      success: false, 
      error: error.toString(),
      message: 'Terjadi kesalahan saat mencari transaksi'
    };
    return createJsonResponse(errorResponse, 500);
  }
}

/**
 * Menangani request POST untuk menambah transaksi baru.
 * @param {object} e - Event parameter dari request.
 * @returns {ContentService.TextOutput} - Response JSON.
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(TRANSAKSI_SPREADSHEET_ID).getSheetByName(TRANSAKSI_SHEET_NAME);
    const data = JSON.parse(e.postData.contents);
    
    // Generate ID baru (auto-increment) - Fixed to use proper sequential numbers
    const newId = getNextTransactionId();
    
    // Generate kode transaksi unik (contoh: INV-TIMESTAMP)
    const kodeTransaksi = `INV-${new Date().getTime()}`;
    
    // Dapatkan tanggal dan waktu saat ini
    const now = new Date();
    const tanggalTransaksi = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const waktuTransaksi = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');

    const newRow = [
      newId,
      data.nama || '',
      data.destinasi || '',
      data.penumpang || 0,
      data.tanggal_berangkat || '',
      data.waktu_berangkat || '',
      data.kendaraan || '',
      data.total || 0,
      data.status || 'pending', // Status default
      kodeTransaksi,
      waktuTransaksi,
      tanggalTransaksi
    ];
    
    sheet.appendRow(newRow);
    
    // Increment visitor count for destinations
    if (data.destinasi) {
      const destinasiNames = data.destinasi.split(', ').map(name => name.trim());
      incrementDestinationVisitors(destinasiNames);
    }
    
    const response = { 
      success: true, 
      message: 'Transaksi berhasil ditambahkan',
      id: newId,
      kode: kodeTransaksi
    };
    return createJsonResponse(response, 201);

  } catch (error) {
    const errorResponse = { success: false, error: error.toString() };
    return createJsonResponse(errorResponse, 500);
  }
}

// =================== FUNGSI HELPERS ===================

/**
 * Membuat response JSON standar.
 * @param {object} data - Objek yang akan di-serialize ke JSON.
 * @param {number} statusCode - HTTP status code (default: 200).
 * @returns {ContentService.TextOutput} - Objek response.
 */
function createJsonResponse(data, statusCode = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  // Meskipun tidak ada setStatusCode, ini adalah praktik yang baik
  return output; 
}


// =================== FUNGSI ID GENERATOR ===================

/**
 * Function to ensure new transactions get sequential IDs
 */
function getNextTransactionId() {
  try {
    const sheet = SpreadsheetApp.openById(TRANSAKSI_SPREADSHEET_ID).getSheetByName(TRANSAKSI_SHEET_NAME);
    
    if (!sheet) {
      return 1; // Return 1 if sheet doesn't exist
    }
    
    // Get the last row with data
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return 1; // Return 1 if only header exists
    }
    
    // Get the last ID from the sheet
    const lastId = sheet.getRange(lastRow, 1).getValue();
    
    // If last ID is a number, increment it
    if (typeof lastId === 'number' && !isNaN(lastId)) {
      return lastId + 1;
    }
    
    // If last ID is not a number, count existing rows (excluding header)
    return lastRow;
    
  } catch (error) {
    console.error("❌ Error getting next ID:", error);
    return 1;
  }
}

// =================== FUNGSI INCREMENT VISITOR ===================

/**
 * Function to increment visitor count for destinations
 * @param {string[]} destinasiNames - Array of destination names
 */
function incrementDestinationVisitors(destinasiNames) {
  try {
    const destinasiSheet = SpreadsheetApp.openById(TRANSAKSI_SPREADSHEET_ID).getSheetByName('Destinasi');
    
    if (!destinasiSheet) {
      console.error("❌ Sheet 'Destinasi' not found!");
      return;
    }
    
    const destinasiData = destinasiSheet.getDataRange().getValues();
    const headers = destinasiData[0];
    const rows = destinasiData.slice(1);
    
    // Find nama column index
    const namaIndex = headers.indexOf('nama');
    const dikunjungiIndex = headers.indexOf('dikunjungi');
    
    if (namaIndex === -1 || dikunjungiIndex === -1) {
      console.error("❌ Required columns 'nama' or 'dikunjungi' not found!");
      return;
    }
    
    // For each destination name in the transaction
    for (const destinasiName of destinasiNames) {
      // Find the destination in the Destinasi sheet
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const sheetDestinasiName = row[namaIndex];
        
        // Case-insensitive comparison
        if (sheetDestinasiName && sheetDestinasiName.toString().toLowerCase() === destinasiName.toLowerCase()) {
          // Get current visitor count
          const currentVisitors = parseInt(row[dikunjungiIndex]) || 0;
          const newVisitors = currentVisitors + 1;
          
          // Update the visitor count in the sheet
          destinasiSheet.getRange(i + 2, dikunjungiIndex + 1).setValue(newVisitors);
          
          console.log(`✅ Incremented visitors for "${destinasiName}": ${currentVisitors} → ${newVisitors}`);
          break; // Found and updated, move to next destination
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Error incrementing destination visitors:", error);
  }
}

// =================== SETUP AWAL (Jalankan manual sekali) ===================

/**
 * Fungsi untuk setup header di spreadsheet jika kosong.
 */
function setupTransaksiSheet() {
  try {
    const sheet = SpreadsheetApp.openById(TRANSAKSI_SPREADSHEET_ID).getSheetByName(TRANSAKSI_SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      const headers = [
        'id', 'nama', 'destinasi', 'penumpang', 'tanggal_berangkat', 
        'waktu_berangkat', 'kendaraan', 'total', 'status', 'kode', 
        'waktu_transaksi', 'tanggal_transaksi'
      ];
      sheet.appendRow(headers);
      console.log('Sheet "Transaksi" berhasil disetup dengan header.');
    } else {
      console.log('Sheet "Transaksi" sudah memiliki data, tidak perlu setup.');
    }
  } catch(e) {
    console.error('Gagal setup sheet "Transaksi": ' + e.toString());
  }
}