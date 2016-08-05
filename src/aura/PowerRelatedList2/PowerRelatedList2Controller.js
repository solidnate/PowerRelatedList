({
    doInit : function(component, event, helper) {
        //TODO: do a cleanup on displayFields parameter to make sure it's not invalid (commas, spaces, etc)        
        //build the query
        var soql = "select Id, " + component.get("v.displayFields") + " from " + component.get("v.objectName") + " where " + component.get("v.lookupField") + " = '" + component.get("v.recordId") + "'";		
        console.log(soql);
        //get the describe
        helper.query(component, soql);
        helper.getPlural(component);
    },
    
    filter: function (component, event, helper){    	
        var filter = component.get("v.filter");
        
        if (filter === null || filter === ''){
            component.set("v.filteredResults", component.get("v.results"));    
        } else {
            var goodStuff = _.filter(component.get("v.results"), function(record){
                var contains = false;
                _.forEach(record, function (value){
                    contains = contains || _.includes(_.toString(value), filter);
                    //console.log(value + ":" + _.includes(_.toString(value), filter) + "=" + contains);
                });
                return contains;
            });
            component.set("v.filteredResults", goodStuff);            
        }
        helper.sort(component);
    },
    
    createRecord : function (component) {
        var createRecordEvent = $A.get("e.force:createRecord");
        createRecordEvent.setParams({
            "entityApiName": component.get("v.objectName")
        });
        createRecordEvent.fire();
    },
    
    handleSelect : function (component, event){
		//Here, I want to navigate to the record
		console.log("event");
		console.log(event);        
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": event.getParam("recordId")            
        });
        navEvt.fire();
    }
})