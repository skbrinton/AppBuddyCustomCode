// 3 LEVEL GRID OPTIMIZATION - CHILD JS. This is one of the 4 custom code files for this functionality(2 on parent and 2 on child grid).
//  Apply this file to Parent Grid.


// disable frozen header
GBFreezeHeaders.isFreezeHeadersEnabled = function (){
    return false;
};

GBFreezeHeaders.initiateFreezeHeaders = function (){
    return false;
};

jq(document).ready(function() {
    var parentCount = getChildRowCount(gridData);

    GBFreezeHeaders.isFreezeHeadersEnabled = function (){
        return false;
    };

    jq('.gridBtns .parentName')
        .html(gridInfoMap.p.gridPluralName)
        .append('<span class="recordCnt">('+parentCount+')</span>')
        .append('<span class="createNew createNewLink" >New</span>');

    jq('.gridBtns .createNewLink').click(function(){
        jq('.gridBtnsCell .createNew').click();
    });

    // disable save loader
    showProcessingMsg = function(){
        return false;
    }

});
