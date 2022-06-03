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

const MyReactComponent: React.FC<IMyReactComponentProps> = () => {

    const [rowData] = React.useState([
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
          console.log(data);
        return data.orgHierarchy;
      }, []);

    const gridOptions = {
        // PROPERTIES
        // Objects like myRowData and myColDefs would be created in your application
        rowData: rowData,
        columnDefs: columnDefs,
        pagination: true,
        rowSelection: 'single',


    }

    return (
        <>
            <h2>Sample AG Grid Test</h2>
            <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
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