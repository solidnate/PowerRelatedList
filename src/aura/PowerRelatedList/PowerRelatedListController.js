({
    doInit : function(component, event, helper) {
        //TODO: do a cleanup on displayFields parameter to make sure it's not invalid (commas, spaces, etc)        
        //build the query
        var soql = "select Id, " + component.get("v.displayFields") + " from " + component.get("v.objectName") + " where " + component.get("v.lookupField") + " = '" + component.get("v.recordId") + "'";		
        console.log(soql);
        //get the describe
        helper.query(component, soql);            
        helper.describe(component, component.get("v.objectName")); 
    },
    
    changeSort: function (component, event, helper){
    	console.log(event.target);
        if (component.get("v.sortState.field")===event.target.id){ 
            //same field, flip it!
            if (component.get("v.sortState.direction")==="Ascending"){
                component.set("v.sortState.direction", "Descending");
            } else {
                component.set("v.sortState.direction", "Ascending");
            }
        } else { //new field, set it to that, Ascending
            component.set("v.sortState", {"field":event.target.id, "direction":"Ascending"});
        }
        helper.sort(component);
    },
    
    filter: function (component, event, helper){    	
        var filter = component.get("v.filter");
        
        if (filter === null || filter === ''){
            component.set("v.filteredResults", component.get("v.results"));    
        } else {
            var goodStuff = _.filter(component.get("v.results"), function(record){
                var contains = false;
                _.forEach(record, function (value, key){
                    contains = contains || _.includes(_.toString(value), filter);
                    //console.log(value + ":" + _.includes(_.toString(value), filter) + "=" + contains);
                });
                return contains;
            });
            component.set("v.filteredResults", goodStuff);            
        }
        helper.sort(component);
    },
    
    navToRecord : function(component, event){
        console.log("nav invoked, get id first");
        
        console.log(event.target);
        var recordId = event.target.id;
        console.log(recordId);
        
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": recordId
        });
        navEvt.fire();
    },
    
    createRecord : function (component) {
        var createRecordEvent = $A.get("e.force:createRecord");
        createRecordEvent.setParams({
            "entityApiName": component.get("v.objectName")
        });
        createRecordEvent.fire();
    }
})