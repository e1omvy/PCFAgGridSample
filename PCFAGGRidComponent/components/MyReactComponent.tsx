import * as React from "react";
import 'ag-grid-enterprise';
import { render } from 'react-dom';
import { AgGridReact } from 'ag-grid-react';

// import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
// import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping'

//import { ModuleRegistry } from '@ag-grid-community/core';


interface IMyReactComponentProps {

}

//ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

const MyReactComponent: React.FC<IMyReactComponentProps> = (props) => {
    console.log("--------------------------------");
    console.log(props);
    console.log("--------------------------------");


    const [rowData, setRowData] = React.useState([
        {
            orgHierarchy: ['Erica Rogers'],
            jobTitle: 'CEO',
            employmentType: 'Permanent',
        },
        {
            orgHierarchy: ['Erica Rogers', 'Malcolm Barrett'],
            jobTitle: 'Exec. Vice President',
            employmentType: 'Permanent',
        },

        {
            orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Esther Baker'],
            jobTitle: 'Director of Operations',
            employmentType: 'Permanent',
        },
        {
            orgHierarchy: [
                'Erica Rogers',
                'Malcolm Barrett',
                'Esther Baker',
                'Brittany Hanson',
            ],
            jobTitle: 'Fleet Coordinator',
            employmentType: 'Permanent',
        },
        {
            orgHierarchy: [
                'Erica Rogers',
                'Malcolm Barrett',
                'Esther Baker',
                'Brittany Hanson',
                'Leah Flowers',
            ],
            jobTitle: 'Parts Technician',
            employmentType: 'Contract',
        },
        {
            orgHierarchy: [
                'Erica Rogers',
                'Malcolm Barrett',
                'Esther Baker',
                'Brittany Hanson',
                'Tammy Sutton',
            ],
            jobTitle: 'Service Technician',
            employmentType: 'Contract',
        },
        {
            orgHierarchy: [
                'Erica Rogers',
                'Malcolm Barrett',
                'Esther Baker',
                'Derek Paul',
            ],
            jobTitle: 'Inventory Control',
            employmentType: 'Permanent',
        },

        {
            orgHierarchy: ['Erica Rogers', 'Malcolm Barrett', 'Francis Strickland'],
            jobTitle: 'VP Sales',
            employmentType: 'Permanent',
        },
        {
            orgHierarchy: [
                'Erica Rogers',
                'Malcolm Barrett',
                'Francis Strickland',
                'Morris Hanson',
            ],
            jobTitle: 'Sales Manager',
            employmentType: 'Permanent',
        },
        {
            orgHierarchy: [
                'Erica Rogers',
                'Malcolm Barrett',
                'Francis Strickland',
                'Todd Tyler',
            ],
            jobTitle: 'Sales Executive',
            employmentType: 'Contract',
        },
        {
            orgHierarchy: [
                'Erica Rogers',
                'Malcolm Barrett',
                'Francis Strickland',
                'Bennie Wise',
            ],
            jobTitle: 'Sales Executive',
            employmentType: 'Contract',
        },
        {
            orgHierarchy: [
                'Erica Rogers',
                'Malcolm Barrett',
                'Francis Strickland',
                'Joel Cooper',
            ],
            jobTitle: 'Sales Executive',
            employmentType: 'Permanent',
        },
    ]);


    // const [rowData] = React.useState([[{
    //     "employeeId": 101,
    //     "employeeName": "Erica Rogers",
    //     "jobTitle": "CEO",
    //     "employmentType": "Permanent",
    //     "children": [{
    //         "employeeId": 102,
    //         "employeeName": "Malcolm Barrett",
    //         "jobTitle": "Exec. Vice President",
    //         "employmentType": "Permanent",
    //         "children": [
    //             {
    //                 "employeeId": 103,
    //                 "employeeName": "Leah Flowers",
    //                 "jobTitle": "Parts Technician",
    //                 "employmentType": "Contract"
    //             },
    //             {
    //                 "employeeId": 104,
    //                 "employeeName": "Tammy Sutton",
    //                 "jobTitle": "Service Technician",
    //                 "employmentType": "Contract"
    //             }
    //         ]
    //     }]
    // }]]);

    const [columnDefs] = React.useState([
        { field: 'jobTitle' },
        { field: 'employmentType' },
    ]);


    const autoGroupColumnDef = React.useMemo(() => {
        return {
            headerName: 'Organisation Hierarchy',
            minWidth: 300,
            cellRendererParams: {
                suppressCount: true,
            },
        };
    }, []);

    const getDataPath = React.useCallback((data: { orgHierarchy: any; }) => {
        // console.log(data);
        return data.orgHierarchy;
    }, []);

    const getRowData = () => {
        var result: any = Object.entries(props);
        var dataArr = [];
        for (let i = 0; i < result.length; i++) {
            dataArr.push({
                orgHierarchy: result[i][1]["cr815_name"], //['Erica Rogers'],
                jobTitle: result[i][1]['cr815_jobtitle'],
                employmentType: result[i][1]['cr815_employmenttype'],
                parent: result[i][1]['cr815_parentorghierarchy'],
            });
        }

        console.log(dataArr);

        var parentItems = dataArr.filter(function (item) {
            return item.parent == null;
        });
        for (let i = 0; i < parentItems.length; i++) {
            

        }

    }

    getRowData();

    const gridOptions = {
        // PROPERTIES
        // Objects like myRowData and myColDefs would be created in your application
        rowData: rowData,
        columnDefs: columnDefs,
        pagination: true,
        rowSelection: 'single',
    }
    // indicate if row is a group node


    return (
        <>
            <h2>Sample AG Grid Test</h2>
            <div className="ag-theme-alpine" style={{ height: 400, width: 1000 }}>
                <AgGridReact

                    gridOptions={gridOptions}
                    treeData={true}
                    autoGroupColumnDef={autoGroupColumnDef}
                    getDataPath={getDataPath}
                    animateRows={true}
                    groupDefaultExpanded={-1}>
                </AgGridReact>
            </div>
        </>
    );
};
export default MyReactComponent;