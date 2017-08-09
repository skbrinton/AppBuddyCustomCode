global class GridPicklistDataSource extends VisualEditor.DynamicPickList{
    
    global override VisualEditor.DataRow getDefaultValue(){
        VisualEditor.DataRow defaultValue = new VisualEditor.DataRow('Opportunities With Tasks', 'Opportunities With Tasks');
        return defaultValue;
    }
    global override VisualEditor.DynamicPickListRows getValues() {
        
		VisualEditor.DynamicPickListRows values = new VisualEditor.DynamicPickListRows();
        for (GBLite__GridBuddySettings__c grid : [SELECT GBLite__Grid_Name__c from GBLite__GridBuddySettings__c where GBLite__Default_Definition__c = TRUE]) {
        	VisualEditor.DataRow value = new VisualEditor.DataRow(grid.GBLite__Grid_Name__c,grid.GBLite__Grid_Name__c);
            values.addRow(value);
        }

        return values;
    }
    global override Boolean isValid(Object attributeValue) {
		// TODO implement later
		return true;
    }
}
