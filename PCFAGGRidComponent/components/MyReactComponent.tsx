import * as React from "react";

import { render } from 'react-dom';
import { AgGridReact } from "ag-grid-react";
//import '../../node_modules/ag-grid-community/dist/styles/ag-theme-alpine.css'

// import 'ag-grid-community/dist/styles/ag-grid.css';
// import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

interface IMyReactComponentProps {
    
}
const MyReactComponent: React.FC<IMyReactComponentProps> = () => {

    const [rowData] = React.useState([
        { make: "Toyota", model: "Celica", price: 35000 },
        { make: "Ford", model: "Mondeo", price: 32000 },
        { make: "Porsche", model: "Boxster", price: 72000 }
    ]);

    const [columnDefs] = React.useState([
        { field: 'make' },
        { field: 'model' },
        { field: 'price' }
    ]);
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
            <h2>Sample AG Grid</h2>
            <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
                <AgGridReact
                    gridOptions={gridOptions}>
                </AgGridReact>
            </div>
        </>
    );
};
export default MyReactComponent;