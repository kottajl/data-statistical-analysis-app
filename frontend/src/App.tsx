import * as React from "react";
import { ReactGrid, Column, Row, CellChange, TextCell, DefaultCellTypes, Id, MenuOption, CellLocation, SelectionMode } from "@silevis/reactgrid";
import { ToastContainer, toast } from 'react-toastify';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import "@silevis/reactgrid/styles.css";
import 'react-toastify/dist/ReactToastify.css';
import 'bulma/css/bulma.min.css';

enum VariableType {
  CATEGORICAL = "C",
  NUMERICAL = "N"
}

class Variable {
  name: string;
  type: VariableType;
  values: (string | undefined)[] | (number | undefined)[];

  constructor(name: string, type: VariableType, values: (string | undefined)[] | (number | undefined)[]) {
    this.name = name;
    this.type = type;
    this.values = values;
  }
}

const getVariables = (): Variable[] => [
  {name: "var1", type: VariableType.CATEGORICAL, values: ["a","b",undefined,"d","e",undefined,"g","h"]},
  {name: "var2", type: VariableType.NUMERICAL, values: [0,1,2,3,undefined,4,5,6,7]},
  {name: "var3", type: VariableType.CATEGORICAL, values: ["a","d","5","d","e",undefined,"g","h"]},
  {name: "var4", type: VariableType.NUMERICAL, values: [0,1,2,3,undefined,4,5,6,7,5,5,6,7,8,9,9,9,9]}
];

function getColNameFromVarName(_var: string): string 
{
  return "col_" + _var;
}

const getColumns = (variables: Variable[]): Column[] => [
  {
    columnId: "i",
    width:50,
    resizable: true,
    reorderable: false
  },
  ...variables.map<Column>((variable, idx) => ({
    columnId: getColNameFromVarName(variable.name),
    width: 75, 
    resizable: true,
    reorderable: true
  }))
];

const getRows = (variables: Variable[], num_values: number): Row[] => [
  {
    rowId: "header",
    cells: [
      { type: "header", text: ""},
      ...variables.map<DefaultCellTypes>(
        (variable) => ({ type: "header", text: variable.name + " (" + variable.type + ")"})
      )
    ]
  },
  ...Array.from(Array(num_values).keys()).map<Row>((idx) => ({
    rowId: idx,
    cells: [
      { type: "header", text: String(idx)},
      ...variables.map<DefaultCellTypes>(
        (variable) => ({ type: "text", text: variable.values[idx] === undefined ? "" : String(variable.values[idx])})
      )
    ]
  }))
];

const reorderArray = <T extends {}>(arr: T[], idxs: number[], to: number) => {
  const movedElements = arr.filter((_, idx) => idxs.includes(idx));
  const targetIdx = Math.min(...idxs) < to ? to += 1 : to -= idxs.filter(idx => idx < to).length;
  const leftSide = arr.filter((_, idx) => idx < targetIdx && !idxs.includes(idx));
  const rightSide = arr.filter((_, idx) => idx >= targetIdx && !idxs.includes(idx));
  return [...leftSide, ...movedElements, ...rightSide];
}

function getIndicesMatchingCondition<T>(array: T[], condition: (element: T) => boolean): number[] {
  var array2: number[] = [];
  array.forEach((value, index) => {
    if (condition(value))
      array2.push(index);
  });
  return array2;
}

function showWarning(text: string)
{
  toast.warn(text, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    progress: undefined,
    theme: "light",
    });
}

function App() {
  var variableValuesLength = 20
  var [variables, setVariables] = React.useState<Variable[]>(getVariables());
  var [columns, setColumns] = React.useState<Column[]>(getColumns(variables));
  var [rows, setRows] = React.useState<Row[]>(getRows(variables, variableValuesLength));

  const updateSpreadsheet = (_variables: Variable[]) =>
  {
    setVariables(_variables);
    setColumns(getColumns(_variables));
    setRows(getRows(_variables, variableValuesLength))
  }
  
  const handleColumnsReorder = (targetColumnId: Id, columnIds: Id[]) => {
    var colNames: string[] = columnIds.map((col) => (col as string))

    updateSpreadsheet(reorderArray(variables, 
      getIndicesMatchingCondition(variables, (_var) => colNames.includes(getColNameFromVarName(_var.name))),
      getIndicesMatchingCondition(variables, (_var) => getColNameFromVarName(_var.name) === (targetColumnId as string))[0]
    ));
  }

  const handleColumnResize = (ci: Id, width: number) => {
    setColumns((prevColumns) => {
        const columnIndex = prevColumns.findIndex(el => el.columnId === ci);
        const resizedColumn = prevColumns[columnIndex];
        const updatedColumn = { ...resizedColumn, width };
        prevColumns[columnIndex] = updatedColumn;
        return [...prevColumns];
    });
  }

  const handleContextMenu = (
    selectedRowIds: Id[],
    selectedColIds: Id[],
    selectionMode: SelectionMode,
    _: MenuOption[],
    selectedRanges: CellLocation[][]
  ): MenuOption[] => {
    const menuOptions: MenuOption[] = []
    if (selectionMode === "column")
    {
      if (selectedColIds.includes("i"))
        return menuOptions;

      menuOptions.push({
        id: "removeVariable",
        label: "Remove",
        handler: () => {
          updateSpreadsheet(variables.filter((v) => !selectedColIds.includes(getColNameFromVarName(v.name))))
        }
      });

      menuOptions.push({
        id: "fillMissingValues",
        label: "Fill missing values",
        handler: () => {
          
        }
      });

      menuOptions.push({
        id: "removeOutliers",
        label: "Remove outlier values",
        handler: () => {
          
        }
      });

      menuOptions.push({
        id: "changeType",
        label: "Change type",
        handler: () => {
          
        }
      });
    }
    return menuOptions;
  }

  const handleChanges = (changes: CellChange[]) => { 
    setVariables((prevVariables) => {
      changes.forEach((change) => {
        change = change as CellChange<TextCell>
        const _variables = variables
        const _var = _variables.filter((v) => getColNameFromVarName(v.name) === change.columnId)[0]
        if (_var.type === VariableType.NUMERICAL) {
          const new_val = +change.newCell.text as number
          if (!isNaN(new_val))
            _var.values[change.rowId as number] = new_val
          else
            showWarning("Value is not a number!")
        }
        else if (_var.type === VariableType.CATEGORICAL) {
          _var.values[change.rowId as number] = change.newCell.text
        }
        updateSpreadsheet(_variables)
        //change.rowId;
        //change.columnId;
        //change.newCell.text;
      });
      return [...prevVariables];
    }); 
  }; 

  return <div style={{paddingRight: 10, paddingLeft: 10, paddingTop:5}}>
    <div className="box" style={{padding: 3, marginBottom: 5}}>
      <Menu menuButton={<MenuButton className="button is-light is-normal">File</MenuButton>} menuClassName="fileMenu">
        <MenuItem>Import</MenuItem>
        <MenuItem>Export</MenuItem>
      </Menu>
    </div>
    <ReactGrid 
      rows={rows} 
      columns={columns} 
      onColumnResized={handleColumnResize} 
      onColumnsReordered={handleColumnsReorder} 
      onCellsChanged={handleChanges}
      onContextMenu={handleContextMenu}
      enableColumnSelection 
      stickyTopRows={1} 
      stickyLeftColumns={1}/>
    <ToastContainer />
  </div>
    
  ;
  }; 
export default App;