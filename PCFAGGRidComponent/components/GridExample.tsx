'use strict';

import * as React from "react";
import { useCallback, useMemo, useRef, useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';

import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping'



// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);


const GridExample = () => {


  const rowData1 = [
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
  ];


  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  const [rowData, setRowData] = useState(rowData1);
  const [columnDefs, setColumnDefs] = useState([
    // we're using the auto group column by default!
    { field: 'jobTitle' },
    { field: 'employmentType' },
  ]);
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
    };
  }, []);
  const autoGroupColumnDef = useMemo(() => {
    return {
      headerName: 'Organisation Hierarchy',
      minWidth: 300,
      cellRendererParams: {
        suppressCount: true,
      },
    };
  }, []);
  const getDataPath = useCallback((data: { orgHierarchy: any; }) => {
    return data.orgHierarchy;
  }, []);

  // const onFilterTextBoxChanged = useCallback(() => {
  //   gridRef.current.api.setQuickFilter(
  //     document.getElementById('filter-text-box').value
  //   );
  // }, []);

  return (
    <div style={containerStyle}>
      <div className="example-wrapper">
        <div style={{ marginBottom: '5px' }}>
          <input
            type="text"
            id="filter-text-box"
            placeholder="Filter..."
           // onInput={onFilterTextBoxChanged}
          />
        </div>

        <div style={gridStyle} className="ag-theme-alpine">
          <AgGridReact
            //ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            autoGroupColumnDef={autoGroupColumnDef}
            treeData={true}
            animateRows={true}
            groupDefaultExpanded={-1}
            getDataPath={getDataPath}
          ></AgGridReact>
        </div>
      </div>
    </div>
  );
};


export default GridExample;

