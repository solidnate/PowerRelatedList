({
    saveAnything : function(component, fieldValue) {
        //only save immediately if not overriden;     
        var fieldDescribe = component.get("v.fieldDescribe");
        
        if (component.get("v.instantSave")){
            var helper=this;
            
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
                    
                    var errors = a.getError();
                    console.log(errors)
                    if (errors) {
                        errors.forEach( function (error){

                            //top-level error.  there can be only one
                            if (error.message){
                                helper.toastThis(error.message);                    
                            }

                            //page-level errors (validation rules, etc)
                            if (error.pageErrors){
                                error.pageErrors.forEach( function(pageError) {
                                    helper.toastThis(pageError.message)                     
                                });                 
                            }

                            if (error.fieldErrors){
                                //field specific errors--we'll say what the field is                    
                                for (var fieldName in error.fieldErrors) {
                                    //each field could have multiple errors
                                    error.fieldErrors[fieldName].forEach( function (errorList){ 
                                        helper.toastThis(errorList.message, "Field Error on " + fieldName + " : ")                          
                                    });                                
                                };  //end of field errors forLoop                   
                            } //end of fieldErrors if
                        }); //end Errors forEach
                    }	
                } //end if errors            
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
        
    },

    toastThis : function(message, title) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title || "Error:",
            "message": message,
            "type": "error",
            "mode": "sticky"
        });
        toastEvent.fire();
    }
})