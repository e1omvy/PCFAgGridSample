import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IInputs, IOutputs } from "../generated/ManifestTypes"
import { AgGridReact } from "@ag-grid-community/react";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
type DataSet = ComponentFramework.PropertyTypes.DataSet;
// import "@ag-grid-community/core/dist/styles/ag-grid.css";
// import "@ag-grid-community/core/dist/styles/ag-theme-alpine-dark.css";
import {
    ColDef,
    GridReadyEvent,
    ICellRendererParams,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
    IsServerSideGroupOpenByDefaultParams
} from "@ag-grid-community/core";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ServerSideRowModelModule } from "@ag-grid-enterprise/server-side-row-model";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { MenuModule } from "@ag-grid-enterprise/menu";
import { ColumnsToolPanelModule } from "@ag-grid-enterprise/column-tool-panel";



import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';

import { Panel } from '@fluentui/react/lib/Panel';
import { useBoolean } from '@fluentui/react-hooks';
import { StackItem, TextField } from "office-ui-fabric-react";


// Register the required feature modules with the Grid
ModuleRegistry.registerModules([
    ServerSideRowModelModule,
    RowGroupingModule,
    MenuModule,
    ColumnsToolPanelModule
]);

function getNodes(request: IServerSideGetRowsRequest, data: any[]) {

    const extractRowsFromData: (groupKeys: string[], data: any[]) => any = (
        groupKeys: string[],
        data: any[]
    ) => {
        // if (groupKeys.length === 0) {
        return data.map(function (d) {
            return {
                group: !!d.children,
                taskid: d.taskid,
                taskname: d.taskname,
                apilinestatus: d.apilinestatus,
                startdate: d.startdate,
                enddate: d.enddate,
            };
        });
        //}
        var key = groupKeys[0];
        for (var i = 0; i < data.length; i++) {
            if (data[i].taskid === key) {
                return extractRowsFromData(
                    groupKeys.slice(1),
                    data[i].children.slice()
                );
            }
        }
    };
    return extractRowsFromData(request.groupKeys, data);
}

function createServerSideDatasource() {
    console.log("createServerSideDatasource");

    const dataSource: IServerSideDatasource = {
        getRows: (params: IServerSideGetRowsParams) => {
            console.log("ServerSideDatasource.getRows: params = ", params);

            var filter = '';//params.request.groupKeys[0];
            if (params.request.groupKeys.length == 0) {
                filter = 'NA';
            }
            else {
                filter = params.request.groupKeys[params.request.groupKeys.length - 1];
            }

            fetch("https://org5a3fbf2f.crm8.dynamics.com/api/data/v9.0/new_projectses?$select=new_taskname,new_percentagecomplete,new_taskid,new_apilinestatus,new_startdate,new_enddate&$filter=new_parenttask eq '" + filter + "'")
                .then((resp) => resp.json())
                .then((data: any[]) => {
                    console.log("---------------------------");
                    console.log(data);
                    var allRows = getNodes(params.request, createNodes(data));
                    //  var result = allRows;
                    var request = params.request;
                    var doingInfinite = request.startRow != null && request.endRow != null;
                    var result = doingInfinite
                        ? {
                            rowData: allRows, //allRows.slice(request.startRow, request.endRow),
                            rowCount: allRows.length
                        }
                        : { rowData: allRows };
                    console.log("getRows: result = ", result);
                    setTimeout(function () {
                        params.success(result);
                    }, 200);
                });
        }
    };
    return dataSource;
}

function getAllPageRecords(columnsOnView: DataSetInterfaces.Column[],
    gridParam: DataSet) {

    let functionName = 'loadPagingRecords';
    let pagingDataRows: any = [];
    let currentPageRecordsID = gridParam.sortedRecordIds;

    try {
        for (const pointer in currentPageRecordsID) {
            pagingDataRows[pointer] = {}
            pagingDataRows[pointer]["key"] = currentPageRecordsID[pointer];

            columnsOnView.forEach((columnItem: any, index) => {
                pagingDataRows[pointer][columnItem.name] = gridParam.records[currentPageRecordsID[pointer]].getFormattedValue(columnItem.name);
            });
        }
    } catch (error) {
        console.log(functionName + error);
    }
    return pagingDataRows;
}

function mapCRMColumnsToDetailsListColmns(columnsOnView: any): any {

    let functionName = 'mapCRMColumnsToDetailsListColmns';
    let mappedColumn = []

    try {
        // loop thorugh all columns
        for (const pointer in columnsOnView) {
            mappedColumn.push({
                key: pointer,
                name: columnsOnView[pointer].displayName,
                fieildName: columnsOnView[pointer].name,
                minWidth: 150,
                maxWidth: 200,
                isResizable: true,
                onColumnClick: () => {
                    alert(`Column ${columnsOnView[pointer].displayName} clicked`);
                },
                data: "string",
                onRender: (item: any) => {
                    return React.createElement("span", null, item[columnsOnView[pointer].name])
                }
            })
        }

    } catch (error) {

        console.log(functionName + "  " + error);

    }



    return mappedColumn;

}


export default function App(context: ComponentFramework.Context<IInputs>) {
    // context.factory.requestRender();


    // Dialog start 
    const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);


    // dialog end 

    const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

    const [columnDefs, setcolumnDefs] = useState<ColDef[]>([
        { field: "taskid", hide: true },
        { field: "taskname", hide: true, checkboxSelection: true, },
        { field: "apilinestatus", headerName: 'AP Line Status' },
        { field: "startdate" },
        { field: "enddate" },
        { field: "percentagecomplete" },

        //{ field: "employmentType" }
    ]);

    const defaultColDef = useMemo<ColDef>(() => {
        return {
            width: 240,
            filter: "agTextColumnFilter",
            flex: 1,
            sortable: true,
            resizable: true,
        };
    }, []);

    const autoGroupColumnDef = useMemo<ColDef>(() => {
        return {
            field: "taskname",
            cellRendererParams: {
                innerRenderer: (params: ICellRendererParams) => {
                    // display employeeName rather than group key (employeeId)
                    return params.data.taskname;
                },
                suppressCount: true,
                checkbox: true,
            }
        };
    }, []);
    const isServerSideGroupOpenByDefault = useCallback(

        (params: IsServerSideGroupOpenByDefaultParams) => {
            // open first two levels by default
            console.log("isServerSideGroupOpenByDefault");
            return params.rowNode.level < 2;
        },
        []
    );
    const isServerSideGroup = useCallback((dataItem: any) => {
        // indicate if node is a group
        return dataItem.group;
    }, []);
    const getServerSideGroupKey = useCallback((dataItem: any) => {
        // specify which group key to use
        return dataItem.taskid;
    }, []);

    const onGridReady = useCallback((params: GridReadyEvent) => {
        console.log("onGridReady");

        //@ts-ignore
        console.log(Xrm.Utility.getGlobalContext());

        fetch("https://org5a3fbf2f.crm8.dynamics.com/api/data/v9.0/new_projectses?$select=new_taskname,new_percentagecomplete,new_taskid,new_apilinestatus,new_startdate,new_enddate&$filter=new_parenttask eq 'NA'")
            .then((resp) => resp.json())
            .then((data: any[]) => {
                console.log("---------------------------");
                console.log(data);
                const nodes = createNodes(data);
                console.log(nodes);
                //var fakeServer = createFakeServer(nodes);
                var datasource = createServerSideDatasource();
                //console.log(fakeServer);
                console.log(datasource);
                params.api!.setServerSideDatasource(datasource);
            });
    }, []);

    useEffect(() => {
        // Update the document title using the browser API
    });

    function BatchPostAccounts() {
        this.apiUrl = Xrm.Utility.getGlobalContext().getClientUrl() + 
            "/api/data/v9.1/";
        this.uniqueId = "batch_" + (new Date().getTime());
        this.batchItemHeader = "--" + 
            this.uniqueId + 
            "\nContent-Type: application/http\nContent-Transfer-Encoding:binary";
        this.content = [];
    }
        
    
    BatchPostAccounts.prototype.addRequestItem = function(entity) {
        this.content.push(this.batchItemHeader);
        this.content.push("");
        this.content.push("POST " + this.apiUrl + "accounts" + " HTTP/1.1");
        this.content.push("Content-Type: application/json;type=entry");
        this.content.push("");
        this.content.push(JSON.stringify(entity));
    }
        
    
    BatchPostAccounts.prototype.sendRequest = function() {
        this.content.push("");
        this.content.push("--" + this.uniqueId + "--");
        this.content.push(" ");
    
        var xhr = new XMLHttpRequest();
        xhr.open("POST", encodeURI(this.apiUrl + "$batch"));
        xhr.setRequestHeader("Content-Type", "multipart/mixed;boundary=" + 
            this.uniqueId);
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("OData-MaxVersion", "4.0");
        xhr.setRequestHeader("OData-Version", "4.0");
        xhr.addEventListener("load", 
            function() { 
                console.log("Batch request response code: " + xhr.status); 
            });
        
        xhr.send(this.content.join("\n"));
    }

    function updateEntity() {
        console.log("Update -------------------");
        // const requestOptions = {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         "@odata.type": "Microsoft.Dynamics.CRM.contact",
        //         "new_apilinestatus": "Updated",
        //     })
        // };
        // fetch('https://reqres.in/api/posts', requestOptions)
        //     .then(response => response.json())
        //     .then(data => { console.log(data) });

        var firstAccount = {
            new_apilinestatus: "Test Account 1"
        }

        var secondAccount = {
            new_apilinestatus: "Test Account 2"
        }

        var batchRequest = new BatchPostAccounts();
        batchRequest.addRequestItem(firstAccount);
        batchRequest.addRequestItem(secondAccount);   
        batchRequest.sendRequest();

    }


    return (

        <div style={containerStyle}>

            <DefaultButton secondaryText="" onClick={openPanel} text="Update Record(s)" />

            <br />
            <div style={gridStyle} className="ag-theme-alpine-dark">

                <AgGridReact
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    autoGroupColumnDef={autoGroupColumnDef}
                    rowModelType={"serverSide"}
                    serverSideStoreType={"partial"}
                    treeData={true}
                    rowSelection={"multiple"}
                    animateRows={true}
                    isServerSideGroupOpenByDefault={isServerSideGroupOpenByDefault}
                    isServerSideGroup={isServerSideGroup}
                    getServerSideGroupKey={getServerSideGroupKey}
                    onGridReady={onGridReady}
                    groupDefaultExpanded={-1}
                ></AgGridReact>


            </div>

            <Panel
                headerText="Update records"
                isOpen={isOpen}
                onDismiss={dismissPanel}
                // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
                closeButtonAriaLabel="Close"
            >
                <StackItem>
                    <TextField label="AP line Staus" />
                </StackItem>
                <StackItem>
                    <PrimaryButton onClick={updateEntity} text="Save" />
                    <DefaultButton onClick={dismissPanel} text="Cancel" />
                </StackItem>


            </Panel>



        </div>
    );
}




function createNodes(data: any) {
    let dtemp = [];
    let d = data.value;
    for (let i = 0; i < d.length; i++) {
        dtemp.push({
            "taskname": d[i].new_taskname,
            "taskid": d[i].new_taskid,
            "apilinestatus": d[i].new_apilinestatus,
            "startdate": d[i].new_startdate,
            "enddate": d[i].new_enddate,
            "percentagecomplete": d[i].new_percentagecomplete,
            "children": [
            ]
        });
    }
    console.log(dtemp);
    return dtemp;
}
 