import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IInputs, IOutputs } from "../generated/ManifestTypes"
import { AgGridReact } from "@ag-grid-community/react";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
type DataSet = ComponentFramework.PropertyTypes.DataSet;

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

import Moment from 'react-moment';
import * as moment from "moment";

import Select from 'react-select';

import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';

import { Panel } from '@fluentui/react/lib/Panel';
import { useBoolean } from '@fluentui/react-hooks';
import { DatePicker, IStackProps, IStackStyles, Label, Stack, StackItem, TextField } from "office-ui-fabric-react";
import { appConfig } from "./constants";


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
                guid: d.guid,
                taskname: d.taskname,
                aplinestatus: d.aplinestatus,
                startdate: d.startdate,
                enddate: d.enddate,
                percentagecomplete: d.percentagecomplete
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

            //@ts-ignore
            fetch(Xrm.Page.context.getClientUrl() + appConfig.GET_URL.FILTER_DATA + filter + "'")
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

const stackTokens = { childrenGap: 50 };
const stackStyles: Partial<IStackStyles> = { root: { width: 300 } };
const columnProps: Partial<IStackProps> = {
    tokens: { childrenGap: 15 },
    styles: { root: { width: 300 } },
};


export default function App(context: ComponentFramework.Context<IInputs>) {

    // Panel open  
    const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);

    const [aplineStatus, setAplineStatus] = useState('');
    const [optionsAPLineStatus, setOptionsAPLineStatus] = useState([{ value: "", label: "" }]);
    const [optionsAPLineStatusLabelOnly, setOptionsAPLineStatusLabelOnly] = useState<string[]>([]);
    const [startdate, setStartDate] = useState(new Date());
    const [enddate, setEndDate] = useState(new Date());
    const [activeUpdateButton, setActiveUpdateButton] = useState(true);

    const gridRef = React.useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

    const [columnDefs] = useState<ColDef[]>([
        { field: "taskid", hide: true },
        { field: "taskname", hide: true, checkboxSelection: true, },
        { field: "guid", hide: true },
        {
            field: "aplinestatus", headerName: 'AP Line Status', editable: true,

            cellEditor: 'select',
            cellRenderer: function (data: any) {
                //var color = colors.find(color => color.id == data.value || color.name == data.value);
                var apstatus = optionsAPLineStatus.find(s => s.value == data.value);
                // here I've added the check for 'color.id' and 'color.name' because initailly from DB will com the id and afterwards form selectparams will come the name
                console.log(data);
                return apstatus?.label;
            },
            onCellValueChanged: function (data: any) {
                /**
                 * because 'select' does not offer us the possibility to use 'key-value' as traditional,
                 * we will use only values in 'select' and changed to 'id' when will be saved.
                 */
                console.log(data);
                var apVal = data.data.aplinestatus;
                var guid = data.data.guid;
                var oldVal = data.oldValue;
                var newVal = optionsAPLineStatus.find(x => x.label == apVal)?.value;
                if(oldVal == newVal) return;
                 
                updateSingleEntity(guid, newVal, "crfb2_aplinestatus")
            },
            cellEditorParams: {
                //values: optionsAPLineStatus.map( x => x.label)
                values : optionsAPLineStatusLabelOnly
            }


        },
        { field: "startdate", headerName: 'Start Date' },
        { field: "enddate", headerName: 'End Date' },
        { field: "percentagecomplete", headerName: '% Complete', editable: true },
    ]);

    const defaultColDef = useMemo<ColDef>(() => {
        return {
            width: 240,
            filter: "agTextColumnFilter",
            flex: 1,
            editable: true,
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
        //@ts-ignore
        fetch(Xrm.Page.context.getClientUrl() + appConfig.GET_URL.PARENT_DATA)
            .then((resp) => resp.json())
            .then((data: any[]) => {
                const nodes = createNodes(data);
                var datasource = createServerSideDatasource();
                console.log(datasource);
                params.api!.setServerSideDatasource(datasource);
            });
    }, []);


    function onCellEditingStopped(event: any) {
        const oldVal = event.oldValue;
        const newVal = event.newValue;
        const colName = "crfb2_" + event.colDef.field; //crfb2_percentagecomplete
        const guid = event.data.guid;
        if (oldVal == newVal) return;

        if(colName ==  "crfb2_aplinestatus") return;

        updateSingleEntity(guid, newVal, colName)
    }

    function onSelectionChanged() {
        console.log(gridRef.current!.api.getSelectedRows());
        let count = gridRef.current!.api.getSelectedRows().length;
        if (count > 0) {
            setActiveUpdateButton(false);
        }
        else {
            setActiveUpdateButton(true);
        }
    }


    useEffect(() => {
        getAPLineLookup();
    }, []);

    function getAPLineLookup() {
        //@ts-ignore
        fetch(Xrm.Page.context.getClientUrl() + appConfig.GET_URL.APLINE_LOOKUP
        ).then((resp) => resp.json())
            .then((data: any) => {
                var arr: any[] = data["OptionSet"]["Options"];
                optionsAPLineStatus.length = 0;
                optionsAPLineStatusLabelOnly.length = 0;
                for (let i = 0; i < arr.length; i++) {
                    var tempValue = arr[i].Value;
                    var tempText = arr[i]["Label"]["UserLocalizedLabel"]["Label"];
                    optionsAPLineStatus.push({ value: tempValue, label: tempText });
                    optionsAPLineStatusLabelOnly.push(tempText);
                }
            });
    }


    function updateSingleEntity(guid: any, newVal: any, column: string) {
        var data = {
            [column]: newVal
        }

        // update the record
        //@ts-ignore
        Xrm.WebApi.updateRecord(appConfig.SCHEMA.ENTITY_NAME_FOR_UPDATE, guid, data).then(
            function success(result: any) {
                //@ts-ignore
                Xrm.Navigation.openAlertDialog("Record has been updated");
                //Xrm.Utility.confirmDialog("Record has been updated");
                gridRef.current!.api.refreshServerSideStore();
            },
            function (error: any) {
                console.log(error);
                //@ts-ignore
                Xrm.Navigation.openAlertDialog("Something went wrong. Please try again.");
            }
        );
    }


    function updateEntity() {
        console.log("Update -------------------");

        var selRows = gridRef.current!.api.getSelectedRows();

        var uniqueID = (new Date()).getTime();

        var data = [];
        data.push('--batch_' + uniqueID);
        data.push('Content-Type: multipart/mixed;boundary=changeset_' + uniqueID);
        data.push('');

        for (let i = 0; i < selRows.length; i++) {
            //first request
            data.push('--changeset_' + uniqueID);
            data.push('Content-Type:application/http');
            data.push('Content-Transfer-Encoding:binary');
            data.push('Content-ID:' + (i + 1));
            data.push('');
            //@ts-ignore
            data.push('PATCH ' + Xrm.Page.context.getClientUrl() + '/api/data/v9.0/' + appConfig.SCHEMA.ENTITY_NAME_FOR_BATCH_UPDATE + '(' + selRows[i].guid + ') HTTP/1.1');
            data.push('Content-Type:application/json;type=entry');
            data.push('');
            data.push('{ "crfb2_aplinestatus":"' + aplineStatus + '", "crfb2_startdate":"' + moment(startdate).format('MM/DD/YYYY') + '", "crfb2_enddate":"' + moment(enddate).format('MM/DD/YYYY') + '" }');
        }


        data.push('--changeset_' + uniqueID + '--');
        //end of batch
        data.push('--batch_' + uniqueID + '--');
        var payload = data.join('\r\n');

        $.ajax(
            {
                method: 'POST',
                //@ts-ignore
                url: Xrm.Page.context.getClientUrl() + '/api/data/v9.0/$batch',
                headers: {
                    'Content-Type': 'multipart/mixed;boundary=batch_' + uniqueID,
                    'Accept': 'application/json',
                    'Odata-MaxVersion': '4.0',
                    'Odata-Version': '4.0'
                },
                data: payload,
                async: false,
                success: function (s) {
                    console.log(s);
                    dismissPanel();
                    //@ts-ignore
                    Xrm.Navigation.openAlertDialog("Record has been updated");
                    //Xrm.Utility.confirmDialog("Record has been updated");
                    gridRef.current!.api.refreshServerSideStore();
                },
                error: function (e) {
                    console.log(e);
                    dismissPanel();
                    //@ts-ignore
                    Xrm.Navigation.openAlertDialog("Something went wrong. Please try again.");
                }
            });
    }



    return (

        <div style={containerStyle}>

            <DefaultButton secondaryText="" onClick={openPanel} text="Update Record(s)" disabled={activeUpdateButton} />

            <br /> <br />
            <div style={gridStyle} className="ag-theme-alpine-dark">

                <AgGridReact
                    ref={gridRef}
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
                    onSelectionChanged={onSelectionChanged}
                    enableGroupEdit={true}
                    onCellEditingStopped={onCellEditingStopped}
                ></AgGridReact>


            </div>

            <Panel
                headerText="Update records"
                isOpen={isOpen}
                onDismiss={dismissPanel}
                // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
                closeButtonAriaLabel="Close"
            >
                <Stack horizontal tokens={stackTokens} styles={stackStyles}>
                    <Stack {...columnProps}>
                        {/* <TextField label="AP Line Status" required
                            onChange={(e) => {
                                const v: any = e.target;
                                setAplineStatus(v.value)
                            }} /> */}

                        <Label>AP Line Status</Label>
                        <Select options={optionsAPLineStatus} className='react-select-container'
                            onChange={val => {
                                const v: any = val?.value;
                                console.log(val);
                                setAplineStatus(v)
                            }}
                        />
                        <DatePicker
                            label="Start Date"
                            placeholder="Select a date..."
                            ariaLabel="Select a date"
                            onSelectDate={(date: any) => setStartDate(date)}
                            value={startdate}
                        />
                        <DatePicker
                            label="End Date"
                            placeholder="Select a date..."
                            ariaLabel="Select a date"
                            onSelectDate={(date: any) => setEndDate(date)}
                            value={enddate}
                        />

                        <Stack horizontal tokens={stackTokens}>
                            <PrimaryButton onClick={updateEntity} text="Save" />
                            <DefaultButton onClick={dismissPanel} text="Cancel" />
                        </Stack>
                    </Stack>
                </Stack>
            </Panel>



        </div>
    );
}




function createNodes(data: any) {
    let dtemp = [];
    let d = data.value;
    for (let i = 0; i < d.length; i++) {
        dtemp.push({
            "taskname": d[i].crfb2_taskname,
            "taskid": d[i].crfb2_taskid,
            "guid": d[i].crfb2_projectid,
            "aplinestatus": d[i].crfb2_aplinestatus,
            "startdate": moment(d[i].crfb2_startdate).format("YYYY-MM-DD") != 'Invalid date' ? moment(d[i].crfb2_startdate).format("YYYY-MM-DD") : '',
            "enddate": moment(d[i].crfb2_enddate).format("YYYY-MM-DD") != 'Invalid date' ? moment(d[i].crfb2_enddate).format("YYYY-MM-DD") : '',
            "percentagecomplete": d[i].crfb2_percentagecomplete,
            "children": [
            ]
        });
    }

    return dtemp;
}
