// =================================================================
// ============== GEMITRA APP SCRIPT - MAIN FILE ===================
// =================================================================

// Konfigurasi Global
const SPREADSHEET_ID = '1KeDQC7cUBsn23K2n1gRP25MJ3844pRiVn67RU06vUdc';
const TRANSAKSI_SHEET_NAME = 'Transaksi';

// =================================================================
// ============== ROUTER UTAMA =====================================
// =================================================================

/**
 * Menangani semua request GET
 */
function doGet(e) {
  try {
    const params = e.parameter || {};
    const endpoint = params.endpoint || '';
    
    // Route berdasarkan endpoint
    switch (endpoint.toLowerCase()) {
      case 'destinations':
        return handleDestinationsRequest(params);
      
      case 'events':
        return handleEventsRequest(params);
      
      case 'feedback':
        return handleFeedbackRequest(params);
      
      case 'comments':
        return handleCommentsRequest(params);
      
      default:
        // Legacy support untuk parameter action
        if (params.action === 'get-transaction') {
          return getTransactionByCode(params.kode);
        }
        
        // Default: ambil semua transaksi
        return getAllTransactions();
    }
    
  } catch (error) {
    return createJsonResponse({ 
      success: false, 
      error: error.toString() 
    });
  }
}

/**
 * Menangani semua request POST
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'create-transaction') {
      return createTransaction(data);
    }
    
    return createJsonResponse({ 
      success: false, 
      error: 'Action tidak dikenal' 
    });
    
  } catch (error) {
    return createJsonResponse({ 
      success: false, 
      error: error.toString() 
    });
  }
}

// =================================================================
// ============== ENDPOINT HANDLERS ===============================
// =================================================================

/**
 * Menangani request untuk destinations
 */
function handleDestinationsRequest(params) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Destinasi');
    if (!sheet) {
      return createJsonResponse({
        success: false,
        error: "Sheet 'Destinasi' tidak ditemukan"
      });
    }

    // Jika ada parameter slug, cari berdasarkan slug
    if (params.slug) {
      return getDestinationBySlug(params.slug);
    }

    // Jika ada parameter id, cari berdasarkan id
    if (params.id) {
      return getDestinationById(params.id);
    }

    // Default: ambil semua destinasi
    return getAllDestinations();
    
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Menangani request untuk events
 */
function handleEventsRequest(params) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Event');
    if (!sheet) {
      return createJsonResponse({
        success: false,
        error: "Sheet 'Event' tidak ditemukan"
      });
    }

    // Jika ada parameter slug, cari berdasarkan slug
    if (params.slug) {
      return getEventBySlug(params.slug);
    }

    // Jika ada parameter id, cari berdasarkan id
    if (params.id) {
      return getEventById(params.id);
    }

    // Jika ada parameter category, filter berdasarkan kategori
    if (params.category) {
      return getEventsByCategory(params.category);
    }

    // Default: ambil semua events
    return getAllEvents();
    
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Menangani request untuk feedback
 */
function handleFeedbackRequest(params) {
  try {
    // Implementasi untuk feedback jika diperlukan
    return createJsonResponse({
      success: false,
      error: "Feedback endpoint belum diimplementasi"
    });
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Menangani request untuk comments
 */
function handleCommentsRequest(params) {
  try {
    // Implementasi untuk comments jika diperlukan
    return createJsonResponse({
      success: false,
      error: "Comments endpoint belum diimplementasi"
    });
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

// =================================================================
// ============== FUNGSI UTAMA =====================================
// =================================================================

/**
 * Mengambil data transaksi berdasarkan kode
 */
function getTransactionByCode(kode) {
  try {
    if (!kode) {
      return createJsonResponse({ 
        success: false, 
        message: 'Parameter kode diperlukan' 
      });
    }
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(TRANSAKSI_SHEET_NAME);
    if (!sheet) {
      return createJsonResponse({ 
        success: false, 
        message: 'Sheet Transaksi tidak ditemukan' 
      });
    }
    
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
      // Convert data types
      if (foundTransaction.total) {
        foundTransaction.total = parseFloat(foundTransaction.total) || 0;
      }
      if (foundTransaction.penumpang) {
        foundTransaction.penumpang = parseInt(foundTransaction.penumpang) || 0;
      }
      
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
      return createJsonResponse(response);
    }
    
  } catch (error) {
    const errorResponse = { 
      success: false, 
      error: error.toString(),
      message: 'Terjadi kesalahan saat mencari transaksi'
    };
    return createJsonResponse(errorResponse);
  }
}

/**
 * Mengambil semua transaksi
 */
function getAllTransactions() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(TRANSAKSI_SHEET_NAME);
    if (!sheet) {
      return createJsonResponse({ 
        success: false, 
        message: 'Sheet Transaksi tidak ditemukan' 
      });
    }
    
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
    
    return createJsonResponse({ 
      success: true, 
      data: transactions,
      message: `Ditemukan ${transactions.length} transaksi`
    });
    
  } catch (error) {
    return createJsonResponse({ 
      success: false, 
      error: error.toString() 
    });
  }
}

/**
 * Membuat transaksi baru
 */
function createTransaction(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(TRANSAKSI_SHEET_NAME);
    const newId = getNextTransactionId();
    const kodeTransaksi = `INV-${new Date().getTime()}`;
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
      'pending',
      kodeTransaksi,
      waktuTransaksi,
      tanggalTransaksi
    ];
    
    sheet.appendRow(newRow);
    
    return { 
      success: true, 
      message: 'Transaksi berhasil ditambahkan',
      id: newId,
      kode: kodeTransaksi
    };
    
  } catch (error) {
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}

/**
 * Mendapatkan ID transaksi berikutnya
 */
function getNextTransactionId() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(TRANSAKSI_SHEET_NAME);
    
    if (!sheet) {
      return 1;
    }
    
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return 1;
    }
    
    const lastId = sheet.getRange(lastRow, 1).getValue();
    
    if (typeof lastId === 'number' && !isNaN(lastId)) {
      return lastId + 1;
    }
    
    return lastRow;
    
  } catch (error) {
    console.error("Error getting next ID:", error);
    return 1;
  }
}

// =================================================================
// ============== FUNGSI HELPER ====================================
// =================================================================

/**
 * Membuat response JSON standar
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// =================================================================
// ============== FUNGSI SETUP =====================================
// =================================================================

/**
 * Setup sheet Transaksi (jalankan manual sekali)
 */
function setupTransaksiSheet() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(TRANSAKSI_SHEET_NAME);
    
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

/**
 * Test fungsi getTransactionByCode
 */
function testGetTransaction() {
  const testKode = 'INV-1755959054202';
  const result = getTransactionByCode(testKode);
  console.log('Test Result:', result.getContent());
}
