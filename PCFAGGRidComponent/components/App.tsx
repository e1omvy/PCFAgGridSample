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
                            employeeId: d.employeeId,
                            employeeName: d.employeeName,
                            employmentType: d.employmentType,
                            jobTitle: d.jobTitle
                        };
                    });
                }
                var key = groupKeys[0];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].employeeId === key) {
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
    const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

    const [columnDefs, setcolumnDefs] = useState<ColDef[]>([
        { field: "employeeId", hide: true },
        { field: "employeeName", hide: true },
        { field: "jobTitle" },
        { field: "employmentType" }
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
            field: "employeeName",
            cellRendererParams: {
                innerRenderer: (params: ICellRendererParams) => {
                    // display employeeName rather than group key (employeeId)
                    return params.data.employeeName;
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
        return dataItem.employeeId;
    }, []);

    const onGridReady = useCallback((params: GridReadyEvent) => {
        console.log("onGridReady");


        let condition: any = {
            attributeName: "new_parenttask",
            conditionOperator: 0,
            value: "Task 1",
        };
        let conditionsArray: any = [];

        conditionsArray.push(condition);
        context.parameters.Projects.filtering.setFilter({
            conditions: conditionsArray,
            filterOperator: 0 /* or */,
        });
        context.parameters.Projects.refresh();

        let columnsOnView = context.parameters.Projects.columns;
        let mappedcolumns = mapCRMColumnsToDetailsListColmns(columnsOnView);
        let pageRows = getAllPageRecords(columnsOnView, context.parameters.Projects);
        console.log("pageRow in App ");
        console.log(pageRows);


        fetch("https://www.ag-grid.com/example-assets/small-tree-data.json")
            .then((resp) => resp.json())
            .then((data: any[]) => {
                console.log("---------------------------");
                console.log(data);
                var fakeServer = createFakeServer(data);
                var datasource = createServerSideDatasource(fakeServer);
                console.log(fakeServer);
                console.log(datasource);
                params.api!.setServerSideDatasource(datasource);

            });

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
                    groupDefaultExpanded={1}
                ></AgGridReact>
            </div>
        </div>
    );
}


