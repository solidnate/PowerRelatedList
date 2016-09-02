({
    saveAnything : function(component, fieldValue) {
        //only save immediately if not overriden;     
        var fieldDescribe = component.get("v.fieldDescribe");
        
        if (component.get("v.instantSave")){
            var record=component.get("v.record");
            
            console.log("recordId : " + record.Id);
            console.log("fieldName : " + fieldDescribe.describe.name);
            console.log(fieldValue);
            
            var params = {
                "recordId" : record.Id,
                "Field" : fieldDescribe.describe.name,
                "newValue" : fieldValue
            };
            
            var action = component.get("c.updateField");
            
            action.setParams(params);
            
            action.setCallback(this, function(a){
                var state = a.getState();
                if (state === "SUCCESS") {
                    console.log(a);
                    component.set("v.simpleOutput", fieldValue);
                }  else if (state === "ERROR") {
                    console.log(a);        	
                }            
            });
            $A.enqueueAction(action);
        } else {
            //emit the object, and let the parent deal with it
            var object = {};
            object[fieldDescribe.describe.name] = fieldValue;
            var fieldChangeEvent = $A.get("e.c:FieldChangeEvent");
            fieldChangeEvent.setParams({"object" : object});
            fieldChangeEvent.fire();
        }
        
    }
})