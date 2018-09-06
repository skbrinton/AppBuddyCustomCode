/**
 * Hides the below specified columns on the SalesPlan Grids:
 * 1. Brand
 * 2. Quantity
 * 3. IsActive
 * 4. Variety
 * 5. Product Line
 */

jq(function() {
  var objName = "OpportunityLineItem";
  var hiddenFields = ["Brand__c","Quantity", "IsActive__c","Variety__c","Product_Line__c","Primary_Crop__c","Maturity__c"];
  var gridInfo = GBGridInfoHelper.getGridInfoByFullObjectName(objName);

  jq(document).ready(function () {
    hideColumns();

    /**
    * Hides specified fields from the grid and mass update widget
    */
    function hideColumns(){
      setTimeout(
        function(){
          var fieldsToHide= [];

          for (var i=0 ;i< gridInfo.metaColumns.length;i++){
            var thisCol = gridInfo.metaColumns[i];
            if(hiddenFields.indexOf(thisCol.fieldName) > -1){
              thisCol.isHidden = true;
              fieldsToHide.push(thisCol.fieldName)
            }
          }

          var trs = jq("#gbMainTableContainer").find("tr");

          for(var i=0; i<trs.length; i++){
            var tr = trs[i];
            var columnLength = fieldsToHide.length - 1;

            for (var j=0;  j<= columnLength ;j++){
              var metacol = getMetaColByFieldName(gridInfoMap.p, fieldsToHide[j]);
              var td = jq(tr).find("[name="+metacol.fieldId+"]");
              if (td != null){
                jq(td).hide();
              }
            }

          }
      },0);
    }
  });
});
