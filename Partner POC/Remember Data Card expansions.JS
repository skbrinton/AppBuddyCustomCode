/* Copyright © 2016 Primal Cause, Inc. All rights reserved. */

/**
 * Custom code that remembers what rows a user had expanded (using browser local storage), 
   Re-expands them when the user revisist the grid
 */
var lastFocusedElement;

jq(document).ready(function() {

	lastFocusedElement = jq(':focus');

	// None of this works if local storage is not supported by browser
	if (typeof(Storage) !== "undefined") {

		expandPreviouslyExpanded();

		// update the lastFocusedElement every time we focus in a legitimate input field
		jq('div.gbPage').delegate('input:not([type="submit"], [type="button"]), textarea', 'focus', function(e) {
			lastFocusedElement = jq(this);
		});

		// fires when we're navigating away from the page: on save, reload and their hotkey equivalents
		jq(window).bind('beforeunload',function(){
			savePreviouslyExpanded();
		});

	}

});

function savePreviouslyExpanded() {

	var expandedRows = jq('tr.dr:has(span.icon-arrow:not(.right)),tr.cr:has(div.childData.expanded)');

	var rowsToRemember = new Array();
	expandedRows.each(function() {
		var expandedRow = jq(this);

		var rowToRemember = { isParentRow : false, parentRowId: '', childTableName : ''};

		rowToRemember.isParentRow = expandedRow.hasClass('dr');

		if (rowToRemember.isParentRow) {
			rowToRemember.parentRowId = expandedRow.attr('id');
		}
		else {
			// If this is a child row, get the id of the parent and the name of the childtable

			// parent is the previous tr.dr
			var parentRow = expandedRow.prev();
			while (parentRow.prev().length) {
				if (parentRow.hasClass('dr')) {
					break;
				}
				parentRow = parentRow.prev();
			}

			rowToRemember.parentRowId = parentRow.attr('id');
			rowToRemember.childTableName = expandedRow.find('table.childTable').attr('name');
		}
		rowsToRemember.push(rowToRemember);

	});


	localStorage.setItem(gridNameForUDF + '-expandedRows', JSON.stringify(rowsToRemember));

	// Save where the focus is if there's a new last focused element
	// lastFocusedElement updated on every focus event
	if(lastFocusedElement.length != 0){
		var focusToRemember = { rowId : '', columnName : '', nodeName : ''};
		focusToRemember.rowId = lastFocusedElement.closest('tr').attr('id');
		focusToRemember.columnName = lastFocusedElement.closest('td').attr('name');
		focusToRemember.nodeName = lastFocusedElement[0].nodeName;

		localStorage.setItem(gridNameForUDF + '-lastFocus', JSON.stringify(focusToRemember));
	}
}

function expandPreviouslyExpanded() {

	var savedExpandedRowsJSON = localStorage.getItem(gridNameForUDF + '-expandedRows');

	if (savedExpandedRowsJSON) {
			
		var rowsToRemember;
		try {
			rowsToRemember = JSON.parse(savedExpandedRowsJSON);

			// Expand parents first
			for (i = 0; i < rowsToRemember.length; i++) {
				var row = rowsToRemember[i];
				//console.log('Row ' + row.parentRowId + ' isParent ' + row.isParentRow + ' childTableName ' + row.childTableName);

				if (row.isParentRow) {
					jq('tr.dr[id='+row.parentRowId+'] td.ui-selectee span.icon-arrow.right').click();
				}
			}

			// After parents are expanded loop again to expand children
			for (i = 0; i < rowsToRemember.length; i++) {
				var row = rowsToRemember[i];
				
				if (!row.isParentRow) {
					var parentRow = jq('tr.dr[id='+row.parentRowId +']');
					var siblings = parentRow.nextUntil('tr.dr');
					
					siblings.each(function() {
						var childRow = jq(this);

						// if this is the right childtable (by name), expand it
						if (childRow.find('table.childTable[name='+row.childTableName+']').length > 0) {
							childRow.find('td.crDataContainer > div.branch > h3.toggleData.collapsed > span > span.icon-arrow.toggleCtrl').click();
						}
					});
				}
			}
		}
		catch(e) {
			// if bad JSON stored at this key, then just replace it.
			console.log('Error parsing expanded row JSON ' + savedExpandedRowsJSON + ', ...deleting local storage entry.');
			localStorage.setItem(gridNameForUDF + '-expandedRows','[]');
		}
		
	}

	var savedFocusJSON = localStorage.getItem(gridNameForUDF + '-lastFocus');
	if (savedFocusJSON) {
			
		var focusToRemember;
		try {
			focusToRemember = JSON.parse(savedFocusJSON);
			if (focusToRemember.rowId) {
				var selectorString = 'tr[id=' + focusToRemember.rowId + '] > td[name=' + focusToRemember.columnName + ']';
				if (focusToRemember.nodeName) {
					selectorString = selectorString + ' ' + focusToRemember.nodeName;
				}
				//console.log(selectorString);
				var focusedElement = jq(selectorString);
				focusedElement.focus();
			}
		}
		catch(e) {
			// if bad JSON stored at this key, then just replace it.
			console.log('Error parsing expanded row JSON ' + savedFocusJSON + ', ...deleting local storage entry.');
			localStorage.setItem(gridNameForUDF + '-lastFocus','');
		}
	}

}
