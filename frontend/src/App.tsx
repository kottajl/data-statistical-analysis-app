import * as React from "react";
import { render } from "react-dom";
import { ReactGrid, Column, Row, CellChange, TextCell, DefaultCellTypes, Id } from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";

interface Variable {
  name: string;
}

interface NumberVariable extends Variable {
  values: (number | undefined)[];
}

interface CategoryVariable extends Variable {
  values: (string | undefined)[];
}

const getVariables = (): (NumberVariable | CategoryVariable)[] => [
  {name: "var1", values: ["a","b",undefined,"d","e",undefined,"g","h"]},
  {name: "var2", values: [0,1,2,3,undefined,4,5,6,7]},
  {name: "var3", values: ["a","d","5","d","e",undefined,"g","h"]},
  {name: "var4", values: [0,1,2,3,undefined,4,5,6,7,5,5,6,7,8,9,9,9,9]}
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

const getRows = (variables: (NumberVariable | CategoryVariable)[], num_values: number): Row[] => [
  {
    rowId: "header",
    cells: [
      { type: "header", text: ""},
      ...variables.map<DefaultCellTypes>(
        (variable) => ({ type: "header", text: variable.name})
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

function App() {
  var variableValuesLength = 20
  var [variables, setVariables] = React.useState<(NumberVariable | CategoryVariable)[]>(getVariables());
  const [columns, setColumns] = React.useState<Column[]>(getColumns(variables));
  const [rows, setRows] = React.useState<Row[]>(getRows(variables, variableValuesLength));

  const handleColumnsReorder = (targetColumnId: Id, columnIds: Id[]) => {
    var colNames: string[] = columnIds.map((col) => (col as string))

    variables = reorderArray(variables, 
      getIndicesMatchingCondition(variables, (_var) => colNames.includes(getColNameFromVarName(_var.name))),
      getIndicesMatchingCondition(variables, (_var) => getColNameFromVarName(_var.name) === (targetColumnId as string))[0]
    );
    setColumns(getColumns(variables));
    setRows(getRows(variables, variableValuesLength))
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

  return <ReactGrid 
    rows={rows} 
    columns={columns} 
    onColumnResized={handleColumnResize} 
    onColumnsReordered={handleColumnsReorder} 
    enableColumnSelection 
    stickyTopRows={1} 
    stickyLeftColumns={1}/>;
  }; 
export default App;

render(<App />, document.getElementById("root"));