({
    doInit : function(component, event, helper) {
        //TODO: do a cleanup on displayFields parameter to make sure it's not invalid (commas, spaces, etc)                
        if(component.get("v.allEditable")){
            component.set("v.editableFields", component.get("v.displayFields"));
        }
        helper.describe(component, component.get("v.sObjectType"));  
    }
    
})