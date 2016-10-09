({
	doInit : function(component, event, helper) {
        component.set("v.showSpinner", true);
		var action = component.get("c.getHistory");
        //    public static string getHistory(string objectAPIName, string recordId){   

        action.setParams({
            "objectAPIName" : component.get("v.sObjectName"),
            "recordId" : component.get("v.recordId")
        });
        
        action.setCallback(this, function(a){
            var data = JSON.parse(a.getReturnValue());            
            //console.log(data);
            _.forEach(data.results, function(value, key){
                //console.log(value);
                //console.log(data.userMap[value.CreatedById].Name);
                data.results[key].createdByName = data.userMap[value.CreatedById].Name;    
                data.results[key].CreatedDate = new Date(data.results[key].CreatedDate);           
            });
            //console.log(data.results);
            component.set("v.histories", data.results);
            component.set("v.showSpinner", false);
        });
        
        $A.enqueueAction(action);
	}
})