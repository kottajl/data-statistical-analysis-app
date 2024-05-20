import * as React from "react";
import { ReactGrid, Column, Row, CellChange, TextCell, DefaultCellTypes, Id, MenuOption, CellLocation, SelectionMode } from "@silevis/reactgrid";
import { showWarning } from "../components/Notifications"
import { Variable, VariableType, getColNameFromVarName } from "../classes/Variable"
import { reorderArray, getIndicesMatchingCondition } from "../classes/Helpers"
import "@silevis/reactgrid/styles.css";

/*const getVariables = (): Variable[] => [
  {name: "var1", type: VariableType.CATEGORICAL, values: ["a","b",undefined,"d","e",undefined,"g","h"]},
  {name: "var2", type: VariableType.NUMERICAL, values: [0,1,2,3,undefined,4,5,6,7]},
  {name: "var3", type: VariableType.CATEGORICAL, values: ["a","d","5","d","e",undefined,"g","h"]},
  {name: "var4", type: VariableType.NUMERICAL, values: [0,1,2,3,undefined,4,5,6,7,5,5,6,7,8,9,9,9,9]}
];*/

export const getColumns = (variables: Variable[]): Column[] => [
{
    columnId: "id",
    width:50,
    resizable: true,
    reorderable: false
},
{
    columnId: "timestamp",
    width:150,
    resizable: true,
    reorderable: false
},
...variables.map<Column>((variable, idx) => ({
    columnId: getColNameFromVarName(variable.name),
    width: getColNameFromVarName(variable.name).length * 10, 
    resizable: true,
    reorderable: true
})),
{
    columnId: "case_id",
    width:75,
    resizable: true,
    reorderable: false
},
];

export const getRows = (variables: Variable[], numValues: number, timestamps: string[], caseIds: string[]): Row[] => [
{
    rowId: "header",
    cells: [
    { type: "header", text: "ID"},
    { type: "header", text: "Time stamp"},
    ...variables.map<DefaultCellTypes>(
        (variable) => ({ type: "header", text: variable.name + " (" + variable.type + ")"})
    ),
    { type: "header", text: "Case ID"}
    ]
},
...Array.from(Array(numValues).keys()).map<Row>((idx) => ({
    rowId: idx,
    cells: [
    { type: "header", text: String(idx+1)},
    { type: "header", text: timestamps[idx]},
    ...variables.map<DefaultCellTypes>(
        (variable) => ({ type: "text", text: variable.values[idx] === undefined ? "" : String(variable.values[idx])})
    ),
    { type: "header", text: caseIds[idx]},
    ]
}))
];

interface SpreadsheetProps {
    variables: Variable[];
    setVariables: React.Dispatch<React.SetStateAction<Variable[]>>;
    variableValuesLength: number;
    setvariableValuesLength: React.Dispatch<React.SetStateAction<number>>;
    timestamps: string[];
    setTimestamps: React.Dispatch<React.SetStateAction<string[]>>;
    caseIds: string[];
    setCaseIds: React.Dispatch<React.SetStateAction<string[]>>;
    selectedColIds: Id[];
    setSelectedColIds: React.Dispatch<React.SetStateAction<Id[]>>;
    columns: Column[];
    setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
    rows: Row[];
    setRows: React.Dispatch<React.SetStateAction<Row[]>>;
    updateSpreadsheet: (updatedVariables: Variable[]) => void;
    setStatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}


export function Spreadsheet({
    variables,
    setVariables,
    variableValuesLength,
    setvariableValuesLength,
    timestamps,
    setTimestamps,
    caseIds,
    setCaseIds,
    selectedColIds,
    setSelectedColIds,
    columns,
    setColumns,
    rows,
    setRows,
    updateSpreadsheet,
    setStatModalOpen
}: SpreadsheetProps) {
    const handleColumnsReorder = (targetColumnId: Id, columnIds: Id[]) => {
        var colNames: string[] = columnIds.map((col) => (col as string))
        if (targetColumnId === "id" || targetColumnId === "timestamp" || targetColumnId === "case_id")
            return;
    
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
          if (selectedColIds.includes("id") || selectedColIds.includes("timestamp") || selectedColIds.includes("case_id"))
            return menuOptions;
    
          menuOptions.push({
            id: "removeVariable",
            label: "Remove",
            handler: () => {
              updateSpreadsheet(variables.filter((v) => !selectedColIds.includes(getColNameFromVarName(v.name))))
            }
          });
    
          menuOptions.push({
            id: "changeType",
            label: "Change type",
            handler: () => {
              const _variables: Variable[] = variables.map((v) =>
              {
                if (!selectedColIds.includes(getColNameFromVarName(v.name)))
                  return v;
                if (v.type === VariableType.CATEGORICAL && v.values.map((v2) => v2 === undefined ? undefined : Number(v2)).includes(NaN))
                {
                  showWarning("Variable '" + v.name + "' can't be converted to numerical type!");
                  return v;
                }
                return new Variable(
                  v.name,
                  v.type === VariableType.NUMERICAL ? VariableType.CATEGORICAL : VariableType.NUMERICAL,
                  v.type === VariableType.NUMERICAL ? v.values.map((v2) => v2 === undefined ? undefined : v2 as string) : v.values.map((v2) => v2 === undefined ? undefined : Number(v2))
                );
              });
              updateSpreadsheet(_variables);
            }
          });
    
          // NUMERICAL VARIABLES ONLY
          if (variables.filter(v => selectedColIds.includes(getColNameFromVarName(v.name)) && v.type === VariableType.CATEGORICAL).length === 0)
          {
            menuOptions.push({
              id: "calculateStatistics",
              label: "Calculate statistics",
              handler: () => {
                setSelectedColIds(selectedColIds);
                setStatModalOpen(true);           
              }
            });
    
            /*menuOptions.push({
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
            });*/
          }
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
              if (change.newCell.text === "")
                _var.values[change.rowId as number] = undefined
              else
              {
                const new_val = +change.newCell.text as number
                if (!isNaN(new_val))
                  _var.values[change.rowId as number] = new_val
                else
                  showWarning("Value is not a number!")
              }
            }
            else if (_var.type === VariableType.CATEGORICAL) 
              if (change.newCell.text === "")
                _var.values[change.rowId as number] = undefined
              else
                _var.values[change.rowId as number] = change.newCell.text
            //console.log(_variables)
            updateSpreadsheet(_variables)
            //change.rowId;
            //change.columnId;
            //change.newCell.text;
          });
          return [...prevVariables];
        }); 
      }; 

  return <ReactGrid
    rows={rows} 
    columns={columns} 
    onColumnResized={handleColumnResize} 
    onColumnsReordered={handleColumnsReorder} 
    onCellsChanged={handleChanges}
    onContextMenu={handleContextMenu}
    enableColumnSelection 
    stickyTopRows={1} 
    stickyLeftColumns={1}
    />

}