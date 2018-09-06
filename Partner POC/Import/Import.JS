/* Import feature works under some conditions which need to be followed - 
 * Add both CSS and JS files on the Grid.
 * The grid should be a Single Object Grid
 * Code does not support 'Owner' field
 * Create an Excel Sheet with API names of the grid fields
 * You can skip any non-required/ optional fields
 * Custom code will add a 'Import' button on top
 * Click on the Import button and it should launch an import window
 * Copy the excel file data along with the field API names and paste it (ctrl+c, ctrl+v)
 * If Excel file import doesn't work, copy the data from Google Spreadsheets
 * To update existing records, add "Id" as the *first* column
 * Save and it should save the imported record on the grid
 */

var importdata;

jq(document).ready(function () {
  init();
});

function init(){

  // append button
  jq('.gbBtnGroup:eq(1)').after('<span class="gbBtnGroup"><input class="importPopup gbBtn" type="button" value="Import" title="Open import from excel popup"></span>')

  // append popup
  jq('body').append('<div id="importBox" class="msgBox boxShadow importBox"> <div id="importDiv"> <div class="header"> <span class="title">Import from spreadsheet</span> <span class="closeX">Close&nbsp;<b>X</b></span> <br clear="all"/> </div><div id="importBtns" class="importInfo"> <div>Please paste the spreadsheet data while this popup is open by clicking Cmd + V or Ctrl + V</div><div>If the data contains record ids, the records will be updated, if they don\'t, new records will be created.</div></div><div id="importBody"> <div id="importStats"></div></div><div id="importBtns"> <input type="button" class="gbBtn applyImport" value="Apply"/> <input type="button" class="gbBtn importCancel" value="Cancel"/> </div></div></div>');

  jq('#importBox').find('span.closeX, .importCancel').click(function () {
    // close the widget
    toggleFieldSelectorPopup(false);
  });

  jq('#importBox .applyImport').click(function () {
    applyImport(false);
  });

  jq('.importPopup').on('click', function(){
    toggleFieldSelectorPopup(true);
  });

  document.addEventListener('paste', handlePaste);
}

function toggleFieldSelectorPopup(pShowBox) {
  var importBox = jq('#importBox');


  if (pShowBox) {
    jq('#importStats').empty();
    importBox.find('.applyImport').hide();

    // center and show the widget, and show the background overlay
    jq('#gbOverlay').show();
    importBox.center();
    importBox.show();
  } else {
    // hide the widget and overlay
    importBox.hide();
    jq('#gbOverlay').hide();
  }
}

function handlePaste (e) {
  var clipboardData, pastedData;

  // Stop data actually being pasted into div
  e.stopPropagation();
  e.preventDefault();

  // Get pasted data via clipboard API
  clipboardData = e.clipboardData || window.clipboardData;
  pastedData = clipboardData.getData('Text');

  // Do whatever with pasteddata
  var rows = pastedData.split(/\r\n|\n|\r/);
  for (var i = 0; i < rows.length; i++) {
    rows[i] = rows[i].split('\t');
  }

  importdata = {
    columns: rows.shift(),
    data: rows
  };

  renderImportStats();
}

function renderImportStats(){
  var hasIds = importdata.columns.some(function(item){
    if (item.toLowerCase() == 'id') return true;
  });
  var statsText = 'The pasted data will ' + (hasIds?'update':'create') + ' ' + importdata.data.length + ' records. Would you like to apply these changes?'

  jq('#importBox .applyImport').show();
  jq('#importStats').empty().append('<span>'+statsText+'</span>')
}

function applyImport(){
  var hasIds = importdata.columns.some(function(item){
    if (item.toLowerCase() == 'id') return true;
  });

  // reverse the order of data so that it looks like the excel sheet
  importdata.data.reverse();

  if(hasIds){
    editRecords();
  }else{
    createNewRecords();
  }
  toggleFieldSelectorPopup(false);
}

function createNewRecords() {
  var importRow;
  var newRow;

  for (var i = 0; i < importdata.data.length; i++) {
    importRow = importdata.data[i];
    newRow = insertNewRow(getDataTable('p'));
    applyRowData(newRow, importRow);
  }
}

function editRecords(){
  for (var i = 0; i < importdata.data.length; i++) {
    importRow = importdata.data[i];
    applyRowData(null, importRow);
  }
}

function applyRowData(rowElem, rowData){
  var colVal;
  var newCol;
  var metaCol;

  for (var j = 0; j < importdata.columns.length; j++) {

    // if column is id, find row
    if(importdata.columns[j].toLowerCase() == 'id'){
      rowElem = jq('#'+rowData[j]);
      continue;
    }

    // fill in column with data
    metaCol = getMetaColByFieldName(gridInfoMap.p, importdata.columns[j].trim());
    colVal = rowData[j];
    newCol = rowElem.find('td[name="' + metaCol.fieldId + '"]');

    // data type specific handling
    if(metaCol.colDataType == 'PICKLIST'){
      newCol.find('.plTxt').click();
    }

    newCol.find('input, select, textarea').val(colVal).change();
  }
}
