export const appConfig = {
    GET_URL: {
        PARENT_DATA: "/api/data/v9.0/new_projectses?$select=new_taskname,new_projectsid,new_percentagecomplete,new_taskid,new_apilinestatus,new_startdate,new_enddate&$filter=new_parenttask eq 'NA'",
        FILTER_DATA: "/api/data/v9.0/new_projectses?$select=new_taskname,new_projectsid,new_percentagecomplete,new_taskid,new_apilinestatus,new_startdate,new_enddate&$filter=new_parenttask eq '"
    },

    SCHEMA: {
        ENTITY_NAME: "new_projects"
    }

}