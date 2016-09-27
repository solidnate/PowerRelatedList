({
	doInit : function(component) {
		var record = component.get("v.record");
		var fieldDescribe = component.get("v.fieldDescribe");        

		//if you don't have read access, we're done here.
		if ( !fieldDescribe.describe.userCanRead){ return;}

		var output;
		var parts = fieldDescribe.original.split(".");
        
        //console.log(parts);        
        try {
        	if (fieldDescribe.related){
           		output = record[parts[0]][parts[1]];
            } else {
                output = record[fieldDescribe.describe.name];            
            } 
        } catch (err){
        	console.log('There was an error getting a value for field ' + fieldDescribe.describe.name)
            console.log(err);
            console.log(parts);
            console.log(record);
            console.log(describe);
            output = null;
        }
        
        
        if (fieldDescribe.describe.type === 'datetime'){
	        $A.createComponent(
	        	"ui:outputDateTime", 
	        	{"value" : output},
	        	function (created, status){
	            
		            if (component.isValid()) {
		            	var body = component.get("v.body");
		            	body.push(created);
		            	component.set("v.body", body);
		            }
	        	}        	        
        	);
	    } else if (fieldDescribe.describe.type === 'date'){
	        $A.createComponent(
	        	"ui:outputDate", 
	        	{"value" : output},
	        	function (created, status){	            
		            if (component.isValid()) {
		            	var body = component.get("v.body");
		            	body.push(created);
		            	component.set("v.body", body);
		            }
	        	}        	        
        	);
	    } else if (fieldDescribe.describe.type === 'url'){
	        $A.createComponent(
	        	"ui:outputURL", 
	        	{
	        		"value" : output, 
	        		"class" : "slds-truncate",
	        		"label" : output
	        	},
	        	function (created, status){
	            
		            if (component.isValid()) {
		            	var body = component.get("v.body");
		            	body.push(created);
		            	component.set("v.body", body);
		            }
	        	}        	        
        	);
	    } else if (fieldDescribe.describe.type === 'boolean'){
	        $A.createComponent(
	        	"ui:outputCheckbox", 
	        	{"value" : output},
	        	function (created, status){	            
		            if (component.isValid()) {
		            	var body = component.get("v.body");
		            	body.push(created);
		            	component.set("v.body", body);
		            }
	        	}        	        
        	);
	    } else if (fieldDescribe.describe.type === 'currency'){
	        $A.createComponent(
	        	"ui:outputCurrency", 
	        	{"value" : output},
	        	function (created, status){	            
		            if (component.isValid()) {
		            	var body = component.get("v.body");
		            	body.push(created);
		            	component.set("v.body", body);
		            }
	        	}        	        
        	);
	    } else {
	    	$A.createComponent(
	        	"ui:outputText", 
	        	{"value" : output},
	        	function (created, status){	            
		            if (component.isValid()) {
		            	var body = component.get("v.body");
		            	body.push(created);
		            	component.set("v.body", body);
		            }
	        	}        	        
        	);
	    }
    }

})