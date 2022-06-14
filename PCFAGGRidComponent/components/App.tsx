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

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([
    ServerSideRowModelModule,
    RowGroupingModule,
    MenuModule,
    ColumnsToolPanelModule
]);

function createFakeServer(fakeServerData: any[]) {

    console.log("createFakeServer");
    const fakeServer = {
        data: fakeServerData,
        getData: function (request: IServerSideGetRowsRequest) {
            const extractRowsFromData: (groupKeys: string[], data: any[]) => any = (
                groupKeys: string[],
                data: any[]
            ) => {
                if (groupKeys.length === 0) {
                    return data.map(function (d) {
                        return {
                            group: !!d.children,
                            taskid: d.taskid,
                            taskname: d.taskname,
                            apilinestatus: d.apilinestatus,
                            startdate: d.startdate,
                            enddate: d.endate,
                        };
                    });
                }
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
            return extractRowsFromData(request.groupKeys, this.data);
        }
    };
    return fakeServer;
}

function createServerSideDatasource(fakeServer: any) {
    console.log("createServerSideDatasource");

    const dataSource: IServerSideDatasource = {
        getRows: (params: IServerSideGetRowsParams) => {
            console.log("ServerSideDatasource.getRows: params = ", params);
            var allRows = fakeServer.getData(params.request);
            var request = params.request;
            var doingInfinite = request.startRow != null && request.endRow != null;
            var result = doingInfinite
                ? {
                    rowData: allRows.slice(request.startRow, request.endRow),
                    rowCount: allRows.length
                }
                : { rowData: allRows };
            console.log("getRows: result = ", result);
            setTimeout(function () {
                params.success(result);
            }, 200);

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

    const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

    const [columnDefs, setcolumnDefs] = useState<ColDef[]>([
        { field: "taskid", hide: true },
        { field: "taskname", hide: true },
        { field: "apilinestatus" },
        { field: "startdate" },
        { field: "enddate" },
        { field: "percentagecomplete" },

        //{ field: "employmentType" }
    ]);

    const defaultColDef = useMemo<ColDef>(() => {
        return {
            width: 240,
            filter: "agTextColumnFilter",
            flex: 1
        };
    }, []);

    const autoGroupColumnDef = useMemo<ColDef>(() => {
        return {
            field: "taskname",
            cellRendererParams: {
                innerRenderer: (params: ICellRendererParams) => {
                    // display employeeName rather than group key (employeeId)
                    return params.data.taskname;
                }
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
        // context.factory.requestRender();

        // var Entity = "new_projects";
        // var Id = "b70e65b5-eadd-ec11-bb3f-000d3af27212";
        // var Select = "?$select=new_taskname";
        // //@ts-ignore
        // Xrm.WebApi.retrieveRecord(Entity,  Select).then(
        //     function success(result: any) {
        //         console.log("Success: " + result.name);
        //     },
        //     function (error: any) {
        //         console.log(error.message);
        //     }
        // );
        //@ts-ignore
        console.log(Xrm.Utility.getGlobalContext());

        fetch("https://org5a3fbf2f.crm8.dynamics.com/api/data/v9.0/new_projectses?$select=new_taskname,new_percentagecomplete,new_taskid,new_apilinestatus,new_startdate,new_enddate&$filter=new_parenttask eq 'NA'")
            .then((resp) => resp.json())
            .then((data: any[]) => {
                console.log("---------------------------");
                console.log(data);
                const nodes = createNodes(data);
                console.log(nodes);
                var fakeServer = createFakeServer(nodes);
                var datasource = createServerSideDatasource(fakeServer);
                console.log(fakeServer);
                console.log(datasource);
                params.api!.setServerSideDatasource(datasource);

            });

        // fetch("https://www.ag-grid.com/example-assets/small-tree-data.json")
        //     .then((resp) => resp.json())
        //     .then((data: any[]) => {
        //         console.log("---------------------------");
        //         console.log(data);
        //         data = [{
        //             "taskid": 101,
        //             "taskname": "111",
        //             "startdate": "aaa",
        //             "children": [{
        //                 "taskid": 102,
        //                 "taskname": "222",
        //                 "startdate": "bbb",
        //                 "children": [{
        //                     "taskid": 103,
        //                     "taskname": "1212",
        //                     "startdate": "ccc",
        //                     "children": [{
        //                         "taskid": 104,
        //                         "taskname": "55",
        //                         "startdate": "ddd"
        //                     }]
        //                 }]
        //             }]

        //         }];

        //         // var fakeServer = createFakeServer(data);
        //         // var datasource = createServerSideDatasource(fakeServer);
        //         // console.log(fakeServer);
        //         // console.log(datasource);
        //         // params.api!.setServerSideDatasource(datasource);

        //     });

    }, []);

    useEffect(() => {
        // Update the document title using the browser API
    });




    return (
        <div style={containerStyle}>
            <div style={gridStyle} className="ag-theme-alpine-dark">

                <AgGridReact
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    autoGroupColumnDef={autoGroupColumnDef}
                    rowModelType={"serverSide"}
                    serverSideStoreType={"partial"}
                    treeData={true}
                    animateRows={true}
                    isServerSideGroupOpenByDefault={isServerSideGroupOpenByDefault}
                    isServerSideGroup={isServerSideGroup}
                    getServerSideGroupKey={getServerSideGroupKey}
                    onGridReady={onGridReady}
                    groupDefaultExpanded={0}
                ></AgGridReact>
            </div>
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

