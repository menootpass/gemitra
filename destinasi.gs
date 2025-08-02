// Google Apps Script untuk API Destinasi
// Mendukung operasi CRUD lengkap

// Konfigurasi
const SPREADSHEET_ID = '1KeDQC7cUBsn23K2n1gRP25MJ3844pRiVn67RU06vUdc'; // Ganti dengan ID spreadsheet Anda
const SHEET_NAME = 'Destinasi'; // Nama sheet

// Fungsi utama untuk menangani semua request
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
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
        result = updateDestinationComment(data);
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

// Fungsi untuk menangani PATCH request (update visitor count)
function doPatch(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    let result;
    
    if (data.action === 'increment' && data.destinasi_id) {
      result = incrementVisitor(data.destinasi_id);
    } else if (data.action === 'increment_by_name' && data.destinasi_name) {
      result = incrementVisitorByName(data.destinasi_name);
    } else {
      result = { error: 'Invalid action or missing parameters' };
    }
    
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
    // Check if slug parameter is provided
    const slug = e.parameter.slug;
    if (slug) {
      const result = getDestinationBySlug(slug);
      var output = ContentService.createTextOutput(JSON.stringify(result));
      output.setMimeType(ContentService.MimeType.JSON);
      return output;
    }
    
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

// Fungsi untuk membuat destinasi baru
function createDestination(data) {
  try {
    console.log('Apps Script - Data yang diterima:', JSON.stringify(data, null, 2));
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    // Generate ID baru (auto increment)
    const lastRow = sheet.getLastRow();
    const newId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1;
    
    // Generate unique slug
    const existingSlugs = getAllExistingSlugs();
    const uniqueSlug = generateUniqueSlug(data.nama || 'destinasi', existingSlugs);
    
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
      data.posisi || '',
      data.harga || 0,
      uniqueSlug, // Add slug
    ];
    // Insert data baru
    sheet.appendRow(newData);
    console.log('Apps Script - Data yang disimpan:', JSON.stringify(newData, null, 2));
    
    return { 
      success: true, 
      message: 'Destinasi berhasil ditambahkan',
      id: newId,
      slug: uniqueSlug
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
    // Generate new slug if nama changed
    let slug = data.slug || '';
    if (data.nama && data.nama !== dataRange[rowIndex - 1][1]) { // If nama changed
      const existingSlugs = getAllExistingSlugs();
      slug = generateUniqueSlug(data.nama, existingSlugs);
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
      data.posisi || '',
      data.harga || 0,
      slug,
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

// Fungsi untuk mengupdate komentar destinasi
function updateDestinationComment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const dataRange = sheet.getDataRange().getValues();
    
    // Cari row berdasarkan ID
    let rowIndex = -1;
    for (let i = 1; i < dataRange.length; i++) {
      if (dataRange[i][0] == data.destinationId) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { error: 'Destinasi tidak ditemukan' };
    }
    
    // Update kolom komentar (kolom 9)
    sheet.getRange(rowIndex, 9).setValue(data.komentar);
    
    return { 
      success: true, 
      message: 'Komentar berhasil diperbarui',
      destinationId: data.destinationId
    };
  } catch (error) {
    return { error: error.toString() };
  }
}

// Fungsi untuk menambah jumlah pengunjung berdasarkan ID (untuk checkout)
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

// Fungsi untuk menambah jumlah pengunjung berdasarkan nama destinasi
function incrementVisitorByName(destinasiName) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const dataRange = sheet.getDataRange().getValues();
    const headers = dataRange[0];
    const rows = dataRange.slice(1);
    
    // Find nama column index
    const namaIndex = headers.indexOf('nama');
    const dikunjungiIndex = headers.indexOf('dikunjungi');
    
    if (namaIndex === -1 || dikunjungiIndex === -1) {
      return { error: 'Required columns not found' };
    }
    
    // Find destination by name (case-insensitive)
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const sheetDestinasiName = row[namaIndex];
      
      if (sheetDestinasiName && sheetDestinasiName.toString().toLowerCase() === destinasiName.toLowerCase()) {
        // Get current visitor count
        const currentVisitors = parseInt(row[dikunjungiIndex]) || 0;
        const newVisitors = currentVisitors + 1;
        
        // Update the visitor count in the sheet
        sheet.getRange(i + 2, dikunjungiIndex + 1).setValue(newVisitors);
        
        return { 
          success: true, 
          destinasi: destinasiName,
          oldCount: currentVisitors,
          newCount: newVisitors 
        };
      }
    }
    
    return { error: `Destinasi "${destinasiName}" tidak ditemukan` };
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
        'posisi',
        'harga',
        'slug', // <--- Tambahkan slug di sini
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    console.log('Spreadsheet berhasil disetup!');
  } catch (error) {
    console.error('Error setup spreadsheet:', error);
  }
}

// Fungsi untuk generate slug dari nama destinasi
function generateSlug(nama) {
  return nama
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
}

// Fungsi untuk generate slug yang unik
function generateUniqueSlug(nama, existingSlugs = []) {
  let baseSlug = generateSlug(nama);
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

// Fungsi untuk mendapatkan semua slug yang ada
function getAllExistingSlugs() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const dataRange = sheet.getDataRange().getValues();
    const headers = dataRange[0];
    const rows = dataRange.slice(1);
    
    const slugIndex = headers.indexOf('slug');
    if (slugIndex === -1) return [];
    
    return rows
      .map(row => row[slugIndex])
      .filter(slug => slug && slug.trim() !== '');
  } catch (error) {
    console.error('Error getting existing slugs:', error);
    return [];
  }
}

// Fungsi untuk mengisi slug yang kosong (jalankan sekali)
function fillEmptySlugs() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const dataRange = sheet.getDataRange().getValues();
    const headers = dataRange[0];
    const rows = dataRange.slice(1);
    
    const slugIndex = headers.indexOf('slug');
    const namaIndex = headers.indexOf('nama');
    
    if (slugIndex === -1 || namaIndex === -1) {
      console.log('Slug atau nama column tidak ditemukan');
      return;
    }
    
    let updatedCount = 0;
    const existingSlugs = getAllExistingSlugs();
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const currentSlug = row[slugIndex];
      const nama = row[namaIndex];
      
      // Jika slug kosong atau tidak ada, generate slug baru
      if (!currentSlug || currentSlug.trim() === '') {
        const newSlug = generateUniqueSlug(nama, existingSlugs);
        sheet.getRange(i + 2, slugIndex + 1).setValue(newSlug);
        existingSlugs.push(newSlug);
        updatedCount++;
      }
    }
    
    console.log(`Berhasil mengisi ${updatedCount} slug yang kosong`);
  } catch (error) {
    console.error('Error filling empty slugs:', error);
  }
}

// Fungsi untuk mendapatkan destinasi berdasarkan slug
function getDestinationBySlug(slug) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const dataRange = sheet.getDataRange().getValues();
    const headers = dataRange[0];
    const rows = dataRange.slice(1);
    
    const slugIndex = headers.indexOf('slug');
    if (slugIndex === -1) {
      return { error: 'Slug column not found' };
    }
    
    // Find destination by slug
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row[slugIndex] === slug) {
        const destination = {};
        headers.forEach((header, index) => {
          destination[header] = row[index];
        });
        return { success: true, data: destination };
      }
    }
    
    return { error: 'Destinasi tidak ditemukan' };
  } catch (error) {
    return { error: error.toString() };
  }
} 