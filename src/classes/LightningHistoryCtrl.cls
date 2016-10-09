public class LightningHistoryCtrl {

    @AuraEnabled
    public static string getHistory(string objectAPIName, string recordId){   
        string parentFieldName = getParentName(objectAPIName);
        string query = 'select field, NewValue, OldValue, CreatedDate, CreatedById from ' + getObjectHistoryName(objectAPIName) + ' where ' + parentFieldName + ' =\'' + recordId + '\' order by CreatedDate DESC'; 
		list<sobject> results = database.query(query);        
        
        //build list of related users
        list<id> userIds = new list<id>();
        
        for (sobject so:results){
            userIds.add( (Id)so.get('CreatedById') );
        }
        
        map<id, user> userMap = new map<id, user>([select Name from User where id in:userIds]);
        
        
        resultsAndUserMap temp = new resultsAndUserMap();
        temp.results = results;
        temp.userMap = userMap;
        temp.parentFieldName = parentFieldName;
        system.debug(temp);
        
        return JSON.serialize(temp);
        
    }
    
    public class resultsAndUserMap {
        public list<sobject> results {get;set;}
        public map<id, user> userMap {get;set;}
        public string parentFieldName {get;set;}
    }
    
    private static string getObjectHistoryName(string objectAPIName){
        if (objectAPIName.contains('__c')){
            return objectAPIName.replace('__c', 'History');
        } 
        return objectAPIName + 'History';

    }
    
    private static string getParentName(string objectAPIName){
        if (objectAPIName.contains('__c')){
            return 'ParentId' ;
        } 
        return objectAPIName + 'Id';
    }
}