// Google Apps Script untuk API Destinasi
// Mendukung operasi CRUD lengkap, update komentar, dan penambahan pengunjung

// Konfigurasi
const SPREADSHEET_ID = '1KeDQC7cUBsn23K2n1gRP25MJ3844pRiVn67RU06vUdc'; // Ganti dengan ID spreadsheet Anda
const SHEET_NAME = 'Destinasi'; // Nama sheet

// Fungsi utama untuk menangani semua request
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Handle transaksi (untuk fitur pengunjung)
    if (data.nama && data.destinasi) {
      return handleTransaction(data);
    }
    
    // Handle update pengunjung
    if (data.destinasi_id && data.action) {
      return handleVisitorUpdate(data);
    }
    
    // Handle operasi CRUD lainnya
    const action = data.action || 'create';
    let result;
    switch(action) {
      case 'create':
        result = createDestination(data);
        break;
      case 'update':
        result = updateDestination(data);
        break;
      case 'updateComment':
        result = updateComment(data);
        break;
      case 'delete':
        result = deleteDestination(data);
        break;
      default:
        result = createDestination(data);
    }
    var output = ContentService.createTextOutput(JSON.stringify(result));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  } catch (error) {
    var output = ContentService.createTextOutput(JSON.stringify({ error: error.toString() }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

// Fungsi untuk menangani PATCH request (update pengunjung)
function doPatch(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const result = handleVisitorUpdate(data);
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi untuk menangani PUT request (update)
function doPut(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const result = updateDestination(data);
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi untuk menangani DELETE request
function doDelete(e) {
  try {
    const id = Number(e.parameter.id);
    const result = deleteDestination({ id });
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi untuk membaca semua data (GET)
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const destinations = rows.map((row, index) => {
      const destination = {};
      headers.forEach((header, i) => {
        destination[header] = row[i];
      });
      return destination;
    });
    var output = ContentService.createTextOutput(JSON.stringify({ data: destinations }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  } catch (error) {
    var output = ContentService.createTextOutput(JSON.stringify({ error: error.toString() }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

// Fungsi untuk menangani transaksi dan menambah pengunjung
function handleTransaction(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Transactions');
    
    // Generate unique code
    const uniqueCode = 'GEM-' + Date.now().toString(36).toUpperCase() + 
                      Math.random().toString(36).substr(2, 5).toUpperCase();
    
    // Prepare row data
    const rowData = [
      uniqueCode,                    // Kode
      data.nama,                    // Nama
      data.destinasi,               // Destinasi
      data.destinasi_harga ? JSON.stringify(data.destinasi_harga) : '', // Harga Destinasi
      data.penumpang,               // Penumpang
      data.tanggal_berangkat,       // Tanggal Berangkat
      data.waktu_berangkat || '',   // Waktu Berangkat
      data.kendaraan,               // Kendaraan
      data.kendaraan_harga || 0,    // Harga Kendaraan
      data.total || 0,              // Total
      data.status || 'success',     // Status
      new Date(),                   // Tanggal Transaksi
      new Date()                    // Waktu Transaksi
    ];
    
    // Append to sheet
    sheet.appendRow(rowData);
    
    // Auto increment pengunjung untuk setiap destinasi dalam transaksi
    const destinasiNames = data.destinasi.split(', ').map((d) => d.trim());
    for (const destinasiName of destinasiNames) {
      incrementVisitorByName(destinasiName);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Transaksi berhasil disimpan',
      kode: uniqueCode
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Gagal menyimpan transaksi: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi untuk update pengunjung berdasarkan ID
function handleVisitorUpdate(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Cari baris destinasi berdasarkan ID
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] == data.destinasi_id) { // Asumsi ID di kolom A
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Destinasi tidak ditemukan'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Ambil nilai pengunjung saat ini (kolom 10 = dikunjungi)
    const currentVisitors = sheet.getRange(rowIndex, 10).getValue() || 0;
    let newVisitors = currentVisitors;
    
    if (data.action === 'increment') {
      newVisitors = currentVisitors + 1;
    } else if (data.action === 'decrement') {
      newVisitors = Math.max(0, currentVisitors - 1);
    }
    
    // Update nilai pengunjung
    sheet.getRange(rowIndex, 10).setValue(newVisitors);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Pengunjung berhasil diupdate',
      pengunjung_baru: newVisitors,
      destinasi_id: data.destinasi_id,
      action: data.action
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Gagal mengupdate pengunjung: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi untuk menambah pengunjung berdasarkan nama destinasi
function incrementVisitorByName(destinasiName) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Cari row berdasarkan nama destinasi
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][1].toLowerCase() === destinasiName.toLowerCase()) { // Kolom B = nama
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      console.warn(`Destinasi tidak ditemukan: ${destinasiName}`);
      return;
    }
    
    // Ambil jumlah pengunjung saat ini (kolom 10 = dikunjungi)
    const currentVisitors = sheet.getRange(rowIndex, 10).getValue() || 0;
    const newVisitors = currentVisitors + 1;
    
    // Update jumlah pengunjung
    sheet.getRange(rowIndex, 10).setValue(newVisitors);
    
    console.log(`Berhasil menambah pengunjung untuk destinasi: ${destinasiName} (${newVisitors})`);
    
  } catch (error) {
    console.error(`Error saat menambah pengunjung untuk destinasi: ${destinasiName}`, error);
  }
}

// Fungsi untuk membuat destinasi baru
function createDestination(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    // Generate ID baru (auto increment)
    const lastRow = sheet.getLastRow();
    const newId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1;
    // Siapkan data untuk insert
    const newData = [
      newId,
      data.nama || '',
      data.lokasi || '',
      data.rating || 0,
      data.kategori || '',
      data.img || '',
      data.deskripsi || '',
      data.fasilitas || '',
      data.komentar || '',
      data.dikunjungi || 0,
      data.posisi || ''
    ];
    // Insert data baru
    sheet.appendRow(newData);
    return { 
      success: true, 
      message: 'Destinasi berhasil ditambahkan',
      id: newId 
    };
  } catch (error) {
    return { error: error.toString() };
  }
}

// Fungsi untuk mengupdate destinasi
function updateDestination(data) {
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
      return { error: 'Destinasi tidak ditemukan' };
    }
    // Update data
    const updateData = [
      data.id,
      data.nama || '',
      data.lokasi || '',
      data.rating || 0,
      data.kategori || '',
      data.img || '',
      data.deskripsi || '',
      data.fasilitas || '',
      data.komentar || '',
      data.dikunjungi || 0,
      data.posisi || ''
    ];
    // Update row
    const range = sheet.getRange(rowIndex, 1, 1, updateData.length);
    range.setValues([updateData]);
    return { 
      success: true, 
      message: 'Destinasi berhasil diperbarui' 
    };
  } catch (error) {
    return { error: error.toString() };
  }
}

// Fungsi untuk mengupdate komentar saja
function updateComment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const dataRange = sheet.getDataRange().getValues();
    
    // Cari row berdasarkan destinationId
    let rowIndex = -1;
    for (let i = 1; i < dataRange.length; i++) {
      if (dataRange[i][0] == data.destinationId) {
        rowIndex = i + 1; // +1 karena sheet dimulai dari 1
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { 
        success: false, 
        message: 'Destinasi tidak ditemukan',
        destinationId: data.destinationId 
      };
    }
    
    // Update hanya kolom komentar (kolom 9, index 8)
    const komentarColumn = 9;
    sheet.getRange(rowIndex, komentarColumn).setValue(data.komentar);
    
    // Log untuk debugging
    console.log(`Updated comment for destination ${data.destinationId} at row ${rowIndex}`);
    console.log(`New comment data: ${data.komentar}`);
    
    return { 
      success: true, 
      message: 'Komentar berhasil diupdate',
      destinationId: data.destinationId,
      row: rowIndex,
      komentar: data.komentar
    };
  } catch (error) {
    console.error('Error updating comment:', error);
    return { 
      success: false, 
      error: error.toString(),
      message: 'Gagal mengupdate komentar'
    };
  }
}

// Fungsi untuk menghapus destinasi
function deleteDestination(data) {
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
      return { error: 'Destinasi tidak ditemukan' };
    }
    // Hapus row
    sheet.deleteRow(rowIndex);
    return { 
      success: true, 
      message: 'Destinasi berhasil dihapus' 
    };
  } catch (error) {
    return { error: error.toString() };
  }
}

// Fungsi untuk menambah jumlah pengunjung (untuk checkout)
function incrementVisitor(id) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const dataRange = sheet.getDataRange().getValues();
    // Cari row berdasarkan ID
    let rowIndex = -1;
    for (let i = 1; i < dataRange.length; i++) {
      if (dataRange[i][0] == id) {
        rowIndex = i + 1;
        break;
      }
    }
    if (rowIndex === -1) {
      return { error: 'Destinasi tidak ditemukan' };
    }
    // Ambil jumlah pengunjung saat ini
    const currentVisitors = sheet.getRange(rowIndex, 10).getValue(); // Kolom 10 = dikunjungi
    const newVisitors = currentVisitors + 1;
    // Update jumlah pengunjung
    sheet.getRange(rowIndex, 10).setValue(newVisitors);
    return { success: true, newCount: newVisitors };
  } catch (error) {
    return { error: error.toString() };
  }
}

// Fungsi untuk setup spreadsheet (jalankan sekali)
function setupSpreadsheet() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    // Set header jika sheet kosong
    if (sheet.getLastRow() === 0) {
      const headers = [
        'id',
        'nama', 
        'lokasi',
        'rating',
        'kategori',
        'img',
        'deskripsi',
        'fasilitas',
        'komentar',
        'dikunjungi',
        'posisi'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // Setup Transactions sheet jika belum ada
    const transactionsSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Transactions');
    if (!transactionsSheet) {
      const newTransactionsSheet = SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet('Transactions');
      const transactionHeaders = [
        'Kode', 'Nama', 'Destinasi', 'Harga Destinasi', 'Penumpang', 'Tanggal Berangkat', 
        'Waktu Berangkat', 'Kendaraan', 'Harga Kendaraan', 'Total', 'Status', 'Tanggal Transaksi', 'Waktu Transaksi'
      ];
      newTransactionsSheet.getRange(1, 1, 1, transactionHeaders.length).setValues([transactionHeaders]);
    }
    
    console.log('Spreadsheet berhasil disetup!');
  } catch (error) {
    console.error('Error setup spreadsheet:', error);
  }
}

// Fungsi untuk testing update komentar
function testUpdateComment() {
  const testData = {
    action: 'updateComment',
    destinationId: 1,
    komentar: JSON.stringify([
      {
        nama: "Test User",
        komentar: "Test comment dari Google Apps Script",
        tanggal: new Date().toISOString()
      }
    ])
  };
  
  const result = updateComment(testData);
  console.log('Test result:', JSON.stringify(result, null, 2));
}

// Fungsi untuk testing update pengunjung
function testUpdateVisitor() {
  const testData = {
    destinasi_id: 1,
    action: 'increment'
  };
  
  const result = handleVisitorUpdate(testData);
  console.log('Test visitor update result:', JSON.stringify(result, null, 2));
} 