({
    //shared by lots of functions.  You give it a comma-separated list of stuff, it returns a trimmed array
    CSL2Array: function (CSL){
        
        try{
            var outputArray = CSL.split(",");
            _.forEach(outputArray, function (value, key){
                outputArray[key] = _.trim(value);
            });
            return outputArray;
        } catch(err){
            //intended to handle the "CSL is null scenario"
            return null;
        }
    },
    
    getPlural: function(component){
        var action = component.get("c.whatsMyPlural");
        //public static String whatsMyPlural(string objtype){
        action.setParams({"objtype" : component.get("v.objectName")});
        action.setCallback(self, function (a){
           console.log("plural returned!")
           console.log(a)
           console.log(a.getReturnValue);           
           component.set("v.pluralLabel", a.getReturnValue());            
        });
        $A.enqueueAction(action);
    },
    
    query: function (component, soql){
        var action = component.get("c.query");
        action.setParams({"soql" : soql});
        action.setCallback(self, function(a){
            console.log("query results");	
            var records = JSON.parse(a.getReturnValue())
            console.log(records);
            component.set("v.results", records);
            component.set("v.filteredResults", records); //initial unfiltered list
        });
        $A.enqueueAction(action);        
    },
    
    //sort always occurs after filter
    sort : function (component){
        var sortState = component.get("v.sortState");
        if (!sortState) return; //if it's not sorted, just skip it
        var results = _.sortBy(component.get("v.filteredResults"), [sortState.field]);
        if (sortState.direction === 'Descending'){
            _.reverse(results);
        }
        component.set("v.filteredResults", results);
    }
})