/**
 * Fix ID column to use sequential numbers (1, 2, 3, 4, 5...)
 * Run this function once to update all existing IDs
 */
function fixTransactionIds() {
  try {
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get the Transactions sheet (adjust sheet name if different)
    const sheet = spreadsheet.getSheetByName("Transactions");
    
    if (!sheet) {
      console.log("❌ Sheet 'Transactions' not found!");
      return;
    }
    
    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    
    // Check if we have data
    if (data.length <= 1) {
      console.log("❌ No data found in sheet!");
      return;
    }
    
    // Get the ID column (assuming it's column A, index 0)
    const idColumnIndex = 0;
    
    // Update IDs starting from row 2 (skip header)
    for (let i = 1; i < data.length; i++) {
      const newId = i; // Sequential number starting from 1
      sheet.getRange(i + 1, idColumnIndex + 1).setValue(newId);
    }
    
    console.log(`✅ Successfully updated ${data.length - 1} IDs to sequential numbers!`);
    
  } catch (error) {
    console.error("❌ Error fixing IDs:", error);
  }
}

/**
 * Alternative function to fix IDs with custom starting number
 * @param {number} startNumber - Starting number for IDs (default: 1)
 */
function fixTransactionIdsCustom(startNumber = 1) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName("Transactions");
    
    if (!sheet) {
      console.log("❌ Sheet 'Transactions' not found!");
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      console.log("❌ No data found in sheet!");
      return;
    }
    
    const idColumnIndex = 0;
    
    // Update IDs with custom starting number
    for (let i = 1; i < data.length; i++) {
      const newId = startNumber + i - 1; // Start from specified number
      sheet.getRange(i + 1, idColumnIndex + 1).setValue(newId);
    }
    
    console.log(`✅ Successfully updated ${data.length - 1} IDs starting from ${startNumber}!`);
    
  } catch (error) {
    console.error("❌ Error fixing IDs:", error);
  }
}

/**
 * Function to ensure new transactions get sequential IDs
 * Add this to your existing doPost function in transaksi.gs
 */
function getNextTransactionId() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName("Transactions");
    
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
    if (typeof lastId === 'number') {
      return lastId + 1;
    }
    
    // If last ID is not a number, count existing rows
    return lastRow;
    
  } catch (error) {
    console.error("❌ Error getting next ID:", error);
    return 1;
  }
}

/**
 * Test function to check current IDs
 */
function checkCurrentIds() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName("Transactions");
    
    if (!sheet) {
      console.log("❌ Sheet 'Transactions' not found!");
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    
    console.log("📊 Current IDs in sheet:");
    for (let i = 1; i < Math.min(data.length, 11); i++) { // Show first 10 rows
      console.log(`Row ${i + 1}: ${data[i][0]}`);
    }
    
    if (data.length > 11) {
      console.log(`... and ${data.length - 11} more rows`);
    }
    
  } catch (error) {
    console.error("❌ Error checking IDs:", error);
  }
} 