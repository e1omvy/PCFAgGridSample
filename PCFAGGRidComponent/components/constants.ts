export const appConfig = {
    GET_URL: {
        // PARENT_DATA: "/api/data/v9.0/new_projectses?$select=new_taskname,new_projectsid,new_percentagecomplete,new_taskid,new_apilinestatus,new_startdate,new_enddate&$filter=new_parenttask eq 'NA'",
        // FILTER_DATA: "/api/data/v9.0/new_projectses?$select=new_taskname,new_projectsid,new_percentagecomplete,new_taskid,new_apilinestatus,new_startdate,new_enddate&$filter=new_parenttask eq '"
        PARENT_DATA: "/api/data/v9.0/crfb2_projects?$select=crfb2_taskid,crfb2_parenttask,crfb2_taskname,crfb2_projectid,crfb2_percentagecomplete,crfb2_aplinestatus,crfb2_startdate,crfb2_enddate&$filter=crfb2_parenttask eq 'NA'",
        FILTER_DATA: "/api/data/v9.0/crfb2_projects?$select=crfb2_taskid,crfb2_parenttask,crfb2_taskname,crfb2_projectid,crfb2_percentagecomplete,crfb2_aplinestatus,crfb2_startdate,crfb2_enddate&$filter=crfb2_parenttask eq '",
        APLINE_LOOKUP: "/api/data/v9.0/EntityDefinitions(LogicalName='crfb2_project')/Attributes(LogicalName='crfb2_aplinestatus')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet($select=Options)"
    },

    SCHEMA: {
        ENTITY_NAME_FOR_UPDATE: "crfb2_project",
        ENTITY_NAME_FOR_BATCH_UPDATE: "crfb2_projects"
    }

}