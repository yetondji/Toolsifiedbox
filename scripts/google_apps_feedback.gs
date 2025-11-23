/*
Google Apps Script: Feedback receiver for Toolsified

Usage:
1. Create a Google Sheet and copy its ID from the URL.
2. Open script.google.com, create a new script, paste this file.
3. Set the `SHEET_ID` variable below to your spreadsheet ID.
4. Deploy -> New deployment -> select "Web app".
   - Who has access: Anyone (if you want public receiving) or Only myself (if you plan to call via auth)
   - Set "Execute as": Me
5. Copy the Web App URL and replace the `ENDPOINT_URL` placeholder in the front-end widget.

This script accepts JSON POST requests and appends rows with the following columns:
timestamp, page_url, page_title, helpful, comment, request_tool, email, device

Note: keep this sheet private if you don't want the data public.
*/

// Replace with your Google Spreadsheet ID (the long id in the sheet URL)
const SHEET_ID = '1YYfXKdn2fleGle1JcRIzvhkLfMSCV6-lMdtnqWSkWG4';
const SHEET_NAME = 'Feedback';

function doPost(e) {
  try {
    // Support both JSON POSTs and URL-encoded form posts.
    var data = {};
    if (e.parameter && Object.keys(e.parameter).length > 0) {
      // Form-encoded data (priority over JSON since this is what browser sends)
      // e.parameter contains form-encoded fields when content-type is application/x-www-form-urlencoded
      data = {
        timestamp: e.parameter.timestamp,
        page_url: e.parameter.page_url,
        page_title: e.parameter.page_title,
        helpful: e.parameter.helpful,
        comment: e.parameter.comment,
        request_tool: e.parameter.request_tool,
        email: e.parameter.email,
        device: e.parameter.device
      };
    } else if (e.postData && e.postData.type && e.postData.type.indexOf('application/json') !== -1 && e.postData.contents) {
      // JSON fallback: try parsing contents as JSON
      data = JSON.parse(e.postData.contents || '{}');
    } else {
      return ContentService.createTextOutput(JSON.stringify({status: 'no data'})).setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // write header
      sheet.appendRow(['timestamp','page_url','page_title','helpful','comment','request_tool','email','device']);
    }

    var timestamp = data.timestamp || new Date().toISOString();
    var page_url = data.page_url || '';
    var page_title = data.page_title || '';
    var helpful = (data.helpful === true || data.helpful === 'true' || data.helpful === 'yes') ? 'yes' : ((data.helpful === false || data.helpful === 'false' || data.helpful === 'no') ? 'no' : 'unknown');
    var comment = data.comment || '';
    var request_tool = data.request_tool || '';
    var email = data.email || '';
    var device = data.device || '';

    sheet.appendRow([timestamp, page_url, page_title, helpful, comment, request_tool, email, device]);

    return ContentService.createTextOutput(JSON.stringify({status: 'ok'})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    // Attempt to record raw incoming data to a debug sheet for troubleshooting
    try {
      var debugSheetName = 'FeedbackDebug';
      var ssDbg = SpreadsheetApp.openById(SHEET_ID);
      var dbg = ssDbg.getSheetByName(debugSheetName);
      if (!dbg) dbg = ssDbg.insertSheet(debugSheetName);
      var rawPost = e && e.postData && e.postData.contents ? e.postData.contents : '';
      var postType = e && e.postData && e.postData.type ? e.postData.type : '';
      var params = e && e.parameter ? JSON.stringify(e.parameter) : '';
      dbg.appendRow([new Date().toISOString(), err.message || '', postType, rawPost, params]);
    } catch (dbgErr) {
      // ignore debug logging failures
    }
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}

// Helpful small GET endpoint to verify the webapp is reachable
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({status: 'ready'})).setMimeType(ContentService.MimeType.JSON);
}
