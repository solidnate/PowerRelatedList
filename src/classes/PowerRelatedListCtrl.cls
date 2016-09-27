public with sharing class PowerRelatedListCtrl {
    
    @AuraEnabled
    public static string query(String soql) {
        return JSON.serialize(Database.query(soql));
    }
    
    @AuraEnabled
    public static String whatsMyPlural(string objtype){
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(objtype);
        Schema.DescribeSObjectResult sobjResult = targetType.getDescribe();
        return sobjResult.getLabelPlural();
    }
    
    @remoteAction @AuraEnabled
    public static String describe(String objtype) {

        /*string cacheKey = 'PRLdescribe' + objtype;
        string existingValue = (string)Cache.Session.get(cacheKey);
        if (existingValue != null){
            return existingValue;
        }*/
        

        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(objtype);
        if (targetType == null) {
            return '[{"message":"The requested resource does not exist","errorCode":"NOT_FOUND"}]';
        }
        
        Schema.DescribeSObjectResult sobjResult = targetType.getDescribe();
        
        Map<String, Schema.SObjectField> fieldMap = sobjResult.fields.getMap();
        
        List<Object> fields = new List<Object>();
        for (String key : fieldMap.keySet()) {
            Schema.DescribeFieldResult descField = fieldMap.get(key).getDescribe();
            Map<String, Object> field = new Map<String, Object>();
            
            field.put('type', descField.getType().name().toLowerCase());
            field.put('name', descField.getName());
            field.put('label', descField.getLabel());
            field.put('userCanRead', descField.isAccessible());
            field.put('userCanEdit', descField.isUpdateable());
            field.put('help', descField.getInlineHelpText());
            field.put('default', descField.getDefaultValue());
            
            //if a field is a picklist, I want the values
            if (field.get('type')=='picklist'){
                List<Schema.PicklistEntry> pickListValues = descField.getPickListValues();
                List<pickListValues> options = new List<picklistValues>();
                for (Schema.PicklistEntry plv : pickListValues) {
                    pickListValues pv = new pickListValues();
                    pv.label = plv.getLabel();
                    pv.value = plv.getValue();
                    options.add(pv);
                }
                field.put('picklistOptions', options);
            }
            
            List<String> references = new List<String>();
            for (Schema.sObjectType t : descField.getReferenceTo()) {
                references.add(t.getDescribe().getName());
            }
            if (!references.isEmpty()) {
                field.put('referenceTo', references);
            }
            
            fields.add(field);
        }
        
        Map<String, Object> result = new Map<String, Object>();
        result.put('fields', fields);
        
        map<string, string> objectProperties = new map<string, string>();
        objectProperties.put('pluralLabel', sobjResult.getLabelPlural());
        result.put('objectProperties', objectProperties);
        
        //let's try to not do that hard work very often
        /*if (Cache.Session.isAvailable()){
            Cache.Session.put(cacheKey, JSON.serialize(result), 600);            
        }*/
        return JSON.serialize(result);
    }
    
    
    @AuraEnabled
    public static void updateField(id recordId, string Field, string newValue){

        
        system.debug(' in the update function');
        Schema.SObjectType sobjectType = recordId.getSObjectType();
        String sobjectName = sobjectType.getDescribe().getName();
        
        SObject obj = Database.query('Select Id, ' + Field + ' From ' + sobjectName + ' Where Id = \'' + recordId + '\'');
        
        //what type of field are we?
        Schema.DisplayType valueType = getFieldType(sobjectName, Field);
        
        if (valueType != Schema.DisplayType.String) {
            // Coerce an incoming String to the correct type
            String svalue = (String)newValue;
            
            if (valueType == Schema.DisplayType.Date) {
                obj.put(Field, Date.valueOf(svalue));
                system.debug('it is a date');
                system.debug(svalue);
                system.debug(Date.valueOf(svalue));
                
            } else if ( valueType == Schema.DisplayType.DateTime) {
                obj.put(Field, DateTime.valueOf(svalue));
            } else if (valueType == Schema.DisplayType.Percent || valueType == Schema.DisplayType.Currency) {               
                obj.put(Field, svalue == '' ? null : Decimal.valueOf(svalue));
            } else if (valueType == Schema.DisplayType.Double) {
                obj.put(Field, svalue == '' ? null : Double.valueOf(svalue));
            } else if (valueType == Schema.DisplayType.Integer) {
                obj.put(Field, Integer.valueOf(svalue));
            } else if (valueType == Schema.DisplayType.Base64) {
                obj.put(Field, EncodingUtil.base64Decode(svalue.split(',')[1]));
            } else {
                obj.put(Field, svalue);
            }
        } else {
            // Just try putting the incoming value on the object
            obj.put(Field, newValue);
        }
        system.debug(obj);
        update obj;
    }
    /*
    send up a JSON object of fields.  Do JSON.stringify on the js controller!
    //lovingly lifted from ngforce
    */
    
    @AuraEnabled
        public static String create(String objtype, String fields) {
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(objtype);
        
        Map<String, Schema.sObjectField> targetFields = targetType.getDescribe().fields.getMap();

        SObject obj = targetType.newSObject();

        Map<String, Object> fieldMap = null;

        String error = writeFields(objType, obj, fields);
        if (error != null) {
            return error;
        }

        try {
            insert obj;
        } catch (DMLException dmle) {
            String fieldNames = '';
            for (String field : dmle.getDmlFieldNames(0)) {
                if (fieldNames.length() > 0) {
                    fieldNames += ',';
                }
                fieldNames += '"' + field + '"';
            }
            return '[{"fields":[' + fieldNames + '],"message":"' + dmle.getDmlMessage(0) + '","errorCode":"' + dmle.getDmlType(0).name() + '"}]';
        }

        Map<String, Object> result = new Map<String, Object>();
        result.put('id', obj.id);
        result.put('object', obj);
        result.put('errors', new List<String>());
        result.put('success', true);

        return JSON.serialize(result);
    }
    
    //lovingly lifted from ngforce
    public static Schema.DisplayType getFieldType(string objectName, string fieldname){
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(objectName);
        Map<String, Schema.sObjectField> targetFields = targetType.getDescribe().fields.getMap();
        return targetFields.get(fieldname).getDescribe().getType();
    }


    private static String writeFields(String objtype, SObject obj, String fields) {
        Map<String, Object> fieldMap = null;
            fieldMap = (Map<String, Object>)JSON.deserializeUntyped(fields);
            fieldMap.remove('attributes');
        

        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(objtype);

        Map<String, Schema.sObjectField> targetFields = targetType.getDescribe().fields.getMap();

        try {
            for (String key : fieldMap.keySet()) {
                if (targetFields.get(key) == null) {
                    system.debug('[{"message":"Field ' + key + ' does not exist on object type ' + objtype + '","errorCode":"INVALID_FIELD"}]');
                    return '[{"message":"Field ' + key + ' does not exist on object type ' + objtype + '","errorCode":"INVALID_FIELD"}]';
                }

                Object value = fieldMap.get(key);
                Schema.DisplayType valueType = targetFields.get(key).getDescribe().getType();

                if (value instanceof String && valueType != Schema.DisplayType.String) {
                    // Coerce an incoming String to the correct type
                    String svalue = (String)value;

                    if (valueType == Schema.DisplayType.Date) {
                        system.debug('doing ' + key + ' : ' + svalue);
                        obj.put(key, Date.valueOf(svalue));
                    } else if ( valueType == Schema.DisplayType.DateTime) {
                        obj.put(key, DateTime.valueOf(svalue));
                    } else if (valueType == Schema.DisplayType.Percent ||
                               valueType == Schema.DisplayType.Currency) {
                        obj.put(key, svalue == '' ? null : Decimal.valueOf(svalue));
                    } else if (valueType == Schema.DisplayType.Double) {
                        obj.put(key, svalue == '' ? null : Double.valueOf(svalue));
                    } else if (valueType == Schema.DisplayType.Integer) {
                        obj.put(key, Integer.valueOf(svalue));
                    } else if (valueType == Schema.DisplayType.Base64) {
                        obj.put(key, EncodingUtil.base64Decode(svalue.split(',')[1]));
                    } else {
                        obj.put(key, svalue);
                    }
                } else {
                    // Just try putting the incoming value on the object
                    obj.put(key, value);
                }
            }
        } catch (SObjectException soe) {
            system.debug(soe.getMessage() + 'INVALID_FIELD');
            //return makeError(soe.getMessage(), 'INVALID_FIELD');
        }

        return null;
    }
    
    public class picklistValues {
        String label {get; set;}
        String value {get; set;}
    }

    public class PRLexception extends exception {} 
    
}