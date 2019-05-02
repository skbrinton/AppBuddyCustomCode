// 3 LEVEL GRID OPTIMIZATION - PARENT JS. This is one of the 4 custom code files for this functionality(2 on parent and 2 on child grid).
//  Apply this file to Parent Grid.Check comments on line # - 11, 14, 23, 130, 131 and make appropriate changes

var GBThreeLevel = (function(window, document, jq) {

    //*** START CONFIG SETTINGS ***//

    //SET UP TO WORK WITH a SINGLE OBJECT CHILD GRID AS THE THIRD LEVEL

    //Update with Name of third level child grid
    var childGridUrl = 'TEST Contacts and Tasks';

    //If more than 1 child object in grid, the order of child object on which to configure the third level
    var orderOfChildObject = 2;

    //Set values as *null* if not in effect - null values will not be added to url string of third level grid
    var params = {
        sh: 0,
        ssb: 0,
        sbb: 1,
        otherRandomString: null //any other random string you want to add to the url, for example: "&sfname=admin_whatever20%I%20Want"
    };
    var fpf = "Opportunity.Id";//important: either use fpf or use id. If you use id, comment out line 130. for fpf comment out line 131


    var iframeHeight = 240;

    //*** END CONFIG SETTINGS *** //


    var numberOfrequiredForCreateFields = {};

    // count editable cols, we need to account for these on the parent when we expand the data card
    var noOfEditableRelCols = 0;
    for (var i = 1; i <= 4; i++) {
        if (gridInfoMap[i] == undefined) {
            break;
        }
        if(gridInfoMap[i].isConcatenatedView == true){
            noOfEditableRelCols++
        }
    }

    function init() {

        // register Save All and Refresh All click events
        jq('.saveBtn, .saveReturnBtn').click(function() {
            var actionName = jq(this).attr('data-action') || 'saveGrid',
                gridIframes = jq('.gridFrame');
            var returnObject = {
                action: actionName
            };

            gridIframes.each(function() {
                jq(this)[0].contentWindow.postMessage(JSON.stringify(returnObject), window.location.origin);
            });
        });
    console.log('childobject')
        // append expandable icons to the child object that needs to be expanded
        jq('.childTable[name="c'+orderOfChildObject+'"] .dr .chk').prepend('<span class="showDataCard"><span class="icon-arrow toggleCtrl"></span></span>');

        jq(mainTableJqueryId).on('click', '.showDataCard', showDataCard);

    }

    function getNoOfFields(gridInfo){
        var metaCols = gridInfo.metaColumns;
        var n = 0;
        for(var i=0; i<metaCols.length; i++){
            if(metaCols[i].renderByDefault())  n++;
        }
        return n;
    }

    function showDataCard(){
        var button = jq(this).find('.icon-arrow'),
            thisRow = button.closest('tr'),
            dataCard = thisRow.next('.dataCard'),
            isInitialized = dataCard.length != 0,
            dataCardHtml,
            rowClasses = thisRow[0].className,
            gridInfo = getGridInfo(button),
            isNewRow = thisRow.hasClass('nr'),
            colspan = getNoOfFields(gridInfo) + 2;

        //TODO: check if this works good
        if(isNewRow && numberOfrequiredForCreateFields[gridInfo.gridId] != undefined){
            // when it's a new row, we have to account for the not configured required fields
            colspan += numberOfrequiredForCreateFields[gridInfo.gridId];
        }

        if(gridInfo.gridId == 'p' && noOfEditableRelCols > 0){
            colspan += noOfEditableRelCols; // account for editable related cols on the parent
        }

        button.toggleClass('expanded');

        if(button.hasClass('expanded')){
            dataCard.addClass('dataCardExpanded');

            // expand
            if(!isInitialized){
                // init and insert row
                dataCardHtml = getDataCardHtml(thisRow);
                thisRow.after('<tr id="'+thisRow.attr('id')+'" class="' + rowClasses + ' dataCard dataCardExpanded"><td class="dataCardCell" colspan="'+ colspan +'">'+dataCardHtml+'</td></tr>')
            }else{
                // already initialized, just show row
                dataCard.show();
            }

            correctColspan(thisRow.closest('tbody'), gridInfo.gridId);

            GBMixpanel.track('Show Three Level Grid', {
                'Source': 'Button'
            });

        }else{
            dataCard.removeClass('dataCardExpanded');
            dataCard.hide();
        }
    }

    function getDataCardHtml(row){
        var recordId = row.attr('id');
        var paramStr = "";
        for(var i in params) {
            if (params[i] != null) {
                paramStr += "&" + i + "=" + params[i];
            }
        }

        //IMPORTANT: use either one of the following lines, not both
        //paramStr += "&fpf=" + fpf + "&fpv=" + recordId; //filter by fpf
        paramStr = "&id=" + recordId + paramStr; //filter by recordId

        return '<iframe class="gridFrame" scrolling="auto" height="'+iframeHeight+'" width="100%" frameborder="0" src="'+window.location.origin+'/apex/Grid?sfname=default&gname='+childGridUrl+paramStr+'"></iframe>'
    }

    function handleNewRow(newRow){
        // find new row
        var childTable = newRow.closest('.childTable'),
            id = '';

        if(childTable.length == 0){
            // it's the parent object
            id = 'p';
        }else{
            id = childTable.attr('name').charAt(1);
        }

        correctColspan(newRow.closest('tbody'), id);

        // prepend expand button
        newRow.find('.dr .chk.ui-selectee').prepend('<span class="showDataCard"><span class="icon-arrow"></span></span>');
    }

    // make sure dataCard colspans are still accurate due to not configured required fields
    function correctColspan(section, gridId){
        var newRows = section.find('>tr.nr');

        if(numberOfrequiredForCreateFields[gridId] != undefined){
            if(newRows.length != 0){
                // if there’s a new row in the section and if there are hidden required columns
                var numberOfCols = newRows.first().find('td:visible').length;
                section.find('>tr.dataCard .dataCardCell').attr('colspan', numberOfCols-1)
            }
        }
    }

    return {
        init: init,
        handleNewRow: handleNewRow
    }

})(window, document, jq); // end GBThreeLevel

jq(document).ready(function() {GBThreeLevel.init()});


//*** OVERRIDE ***//

//override only to remove No changes alert
function beforeFormSubmit() {
    //cout('before submit, btnClick: '+btnClick);

    var unbindAllFormFields = true;

    if (btnClick == 'default') {
        if (stayOnPageForUnsavedChanges(true, false) == true) {
            return false;
        }
        showProcessingMsg(lang.loading);

    } else if (btnClick == 'save') {
        if (GBHelpers.isIE()) {
            // IE has issues with the first input field, especially if it's the first required input in a new row
            // the onchange doesn't register in this case, which could leave a required field still looking required even though the user entered a value
            // so find all the fields marked as required and invalid, and call the onchange programmatically

            var invalidFields = jq(mainTableJqueryId + ' .gbrq'),
              firstInput;

            invalidFields.change();

            // additionally find the first field in the new rows and call the onchange on them for the same reason
            jq(mainTableJqueryId + ' tr.nr').each(function() {
                firstInput = jq(this).find('input,select:not(.wId),textarea').first();
                if (firstInput.length == 1) {
                    firstInput.change();
                }
            });
        }

        var invalidFieldsProcessed = processNextRequiredField();
        if (invalidFieldsProcessed) {
            // there are invalid fields, stop
            return false;
        }

        var invalidOppProdFieldsProcessed = GBRowHelper.processOppProdFields();
        if (invalidOppProdFieldsProcessed) {
            // there are Opportunity Product fields, stop
            return false;
        }

        // no invalid fields, proceed
        GBMixpanel.onGridSave.track();

        try {
            var modifiedData = getModifiedData(),
              newDataStr = getNewData(),
              modifiedDataExists = (jq.trim(modifiedData).length > 0),
              newDataExists = (jq.trim(newDataStr).length > 0);

            //alert('modifiedDataExists: '+modifiedData);

            if (modifiedDataExists==false && newDataExists==false) {
                return false;
            }

            if (modifiedDataExists==true) {
                jq(modDataHidden).val(modifiedData);
            }

            if (newDataExists==true) {
                jq(newDataHidden).val(newDataStr);
            }

        } catch(e) {
            //alert('error: '+e);
        }

        showProcessingMsg(lang.saving);
        // only unbind form fields which are in rows that have no modified fields
        unbindAllFormFields = false;

    } else if (btnClick == 'delete') {
        try {
            if (confirm(lang.delWarn)){
                var processedRecordsForDelete = processRecordsMarkedForDelete();
                if (!processedRecordsForDelete) {
                    if (objectsWithNoDeletePerms.length > 0) {
                        var undeleteableObjectsMsg = new String(lang.noDelPerm);

                        if (objectsWithNoDeletePerms.length == 1) {
                            undeleteableObjectsMsg += ': ' + objectsWithNoDeletePerms[0];
                            undeleteableObjectsMsg += lang.deselectRec;
                        } else {
                            undeleteableObjectsMsg += 's: ' + objectsWithNoDeletePerms.join(', ');
                            undeleteableObjectsMsg += lang.deselectRecMulti;
                        }

                        alert(undeleteableObjectsMsg);

                    } else {
                        alert(lang.noRecForDel);
                    }
                    return false;
                }
            } else {
                return false;
            }
        } catch(e) {}

        showProcessingMsg(lang.deleting);

    } else if (btnClick == 'deleteAll') {
        try {
            if (confirm(lang.delAllWarn)){
                if (!confirm(lang.delAllWarn2)) {
                    return false;
                }
            } else {
                return false;
            }
        } catch(e) {}

        showProcessingMsg(lang.deleting);

    } else if (btnClick == 'edit') {

        GBMixpanel.track('Change Grid Display', {
            'Display Control': 'Edit',
            'Option': '',
            'State': ''
        });

        showProcessingMsg(lang.loading);

    } else if (btnClick == 'cancel') {
        if (stayOnPageForUnsavedChanges(false, false) == true) {
            return false;
        }
        showProcessingMsg(lang.loading);
        // track Read Only
        GBMixpanel.track('Change Grid Display', {
            'Display Control': 'Read Only Button',
            'Option': '',
            'State': ''
        });
    } else if (btnClick == 'refresh') {
        if (stayOnPageForUnsavedChanges(false, false) == true) {
            return false;
        }
        showProcessingMsg(lang.refreshing);
    } else if (btnClick == 'rocRevertBtn') {
        // show processing msg
        showProcessingMsg(lang.reverting);
    } else if (btnClick == 'rocSaveBtn') {
        // run udc validation, if fails return false
        if (!GBUserDefinedCols.validateUdc()) {
            return false;
        }
        showProcessingMsg(lang.saving);
        GBUserDefinedCols.buildJSONForSave();
    }

    // unbind any required textarea fields that were not modified
    // so that salesforce does not validate them and potentially throw an error if there's no value
    unbindFormFields(unbindAllFormFields);

    showSubmitInProgress();
    jq(document.body).css('cursor', 'progress');
    return true;
}
