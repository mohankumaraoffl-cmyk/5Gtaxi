// ==============================================================
// 5G TAXI — Bulletproof Google Sheets Logger
// Supports both GET (URL query) and POST (Fetch)
// ==============================================================

function doGet(e) {
  return processRequest(e);
}

function doPost(e) {
  return processRequest(e);
}

function processRequest(e) {
  try {
    // 1. Extract parameters from GET or POST
    var p = {};
    if (e && e.parameter && Object.keys(e.parameter).length > 0) {
      p = e.parameter;
    } else if (e && e.postData && e.postData.contents) {
      try {
        p = JSON.parse(e.postData.contents);
      } catch (err) {
        p = {};
      }
    }

    // 2. Access the Google Sheet
    // Try active sheet first; fallback to first sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      return ContentService.createTextOutput("Error: Script is not bound to a Spreadsheet. Please create via Extensions > Apps Script inside your sheet.").setMimeType(ContentService.MimeType.TEXT);
    }
    
    var sheet = ss.getSheets()[0]; // Always targets the first tab

    // 3. Create header row if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Name",
        "Mobile",
        "Pickup",
        "Drop",
        "Date",
        "Time",
        "Passengers",
        "Vehicle",
        "Trip Type",
        "Message"
      ]);
      var header = sheet.getRange(1, 1, 1, 11);
      header.setBackground("#0b63ce");
      header.setFontColor("#ffffff");
      header.setFontWeight("bold");
    }

    // 4. Append row with Indian Time (IST)
    var timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd-MM-yyyy HH:mm:ss");
    sheet.appendRow([
      timestamp,
      p.name || "N/A",
      p.mobile || "N/A",
      p.pickup || "N/A",
      p.drop || "N/A",
      p.date || "N/A",
      p.time || "N/A",
      p.passengers || "N/A",
      p.vehicle || "N/A",
      p.trip || "N/A",
      p.message || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Recorded successfully" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
