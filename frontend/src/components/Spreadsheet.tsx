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
    width: (variable.name.length + 6) * 10, 
    resizable: true,
    reorderable: true
})),
];

export const getRows = (variables: Variable[], numValues: number, timestamps: string[]): Row[] => [
{
    rowId: "text",
    cells: [
    { type: "header", text: "ID"},
    { type: "header", text: "Time stamp"},
    ...variables.map<DefaultCellTypes>(
        (variable) => ({ type: "text", text: variable.name + " (" + variable.type + ")", renderer: (text: string) => <div style={{fontWeight: 'bold'}}>{text}</div>})
    ),
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
    selectedColIds: Id[];
    setSelectedColIds: React.Dispatch<React.SetStateAction<Id[]>>;
    columns: Column[];
    setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
    rows: Row[];
    setRows: React.Dispatch<React.SetStateAction<Row[]>>;
    updateSpreadsheet: (updatedVariables: Variable[]) => void;
    setStatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setRenameModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setVariableToRenameId: React.Dispatch<React.SetStateAction<number>>;
    serverAddress: string;
    setMissingValuesModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setMissingVariableIds: React.Dispatch<React.SetStateAction<number[]>>;
    setPlotModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setPlotVariableIds: React.Dispatch<React.SetStateAction<number[]>>;
    setResultModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setResult: React.Dispatch<React.SetStateAction<any>>;
    setResultDescription: React.Dispatch<React.SetStateAction<string>>;
    setCorrelationModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setCorrelationVariableIds: React.Dispatch<React.SetStateAction<number[]>>;
    setMainPlotType: React.Dispatch<React.SetStateAction<string>>;
}


export function Spreadsheet({
    variables,
    setVariables,
    variableValuesLength,
    setvariableValuesLength,
    timestamps,
    setTimestamps,
    selectedColIds,
    setSelectedColIds,
    columns,
    setColumns,
    rows,
    setRows,
    updateSpreadsheet,
    setStatModalOpen,
    setRenameModalOpen,
    setVariableToRenameId,
    serverAddress,
    setMissingValuesModalOpen,
    setMissingVariableIds,
    setPlotModalOpen,
    setPlotVariableIds,
    setResultModalOpen,
    setResult,
    setResultDescription,
    setCorrelationModalOpen,
    setCorrelationVariableIds,
    setMainPlotType
}: SpreadsheetProps) {
    const handleColumnsReorder = (targetColumnId: Id, columnIds: Id[]) => {
        var colNames: string[] = columnIds.map((col) => (col as string))
        if (targetColumnId === "id" || targetColumnId === "timestamp")
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
            const updatedColumn = { ...resizedColumn, width  };
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
          if (selectedColIds.includes("id") || selectedColIds.includes("timestamp"))
            return menuOptions;
  
          if (selectedColIds.length === 1)
            menuOptions.push({
              id: "rename",
              label: "Rename",
              handler: () => {
                 for (let i = 0; i < variables.length; i++)
                  if (getColNameFromVarName(variables[i].name) === selectedColIds[0])
                  {
                    setVariableToRenameId(i);
                    break;
                  }
                 setRenameModalOpen(true);      
              }
            });
            
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
          
          menuOptions.push({
            id: "calculateStatistics",
            label: "Calculate statistics",
            handler: () => {
              setSelectedColIds(selectedColIds);
              setStatModalOpen(true);           
            }
          });

          if (variables.filter(v => selectedColIds.includes(getColNameFromVarName(v.name)) && v.type === VariableType.CATEGORICAL).length === 0 ||
            variables.filter(v => selectedColIds.includes(getColNameFromVarName(v.name)) && v.type === VariableType.NUMERICAL).length === 0)
              menuOptions.push({
                id: "show1dPlot",
                label: "Show 1D plot",
                handler: () => {
                  const variableIds: number[] = [];
                  variables.forEach((v, idx) => {if (selectedColIds.includes(getColNameFromVarName(v.name))) variableIds.push(idx)});
                  setPlotVariableIds(variableIds);
                  setMainPlotType("1d");
                  setPlotModalOpen(true);      
                }
              });

          if (selectedColIds.length === 2 || (selectedColIds.length === 3 && variables.filter(v => selectedColIds.includes(getColNameFromVarName(v.name)) && v.type === VariableType.NUMERICAL).length === 2))
            menuOptions.push({
              id: "show2dPlot",
              label: "Show 2D plot",
              handler: () => {
                const variableIds: number[] = [];
                variables.forEach((v, idx) => {if (selectedColIds.includes(getColNameFromVarName(v.name))) variableIds.push(idx)});
                setPlotVariableIds(variableIds);
                setMainPlotType("2d");
                setPlotModalOpen(true);      
              }
            });
    
          menuOptions.push({
            id: "fillMissingValues",
            label: "Fill missing values",
            handler: () => {
              const variableIds: number[] = [];
              variables.forEach((v, idx) => {if (selectedColIds.includes(getColNameFromVarName(v.name))) variableIds.push(idx)});
              setMissingVariableIds(variableIds);
              setMissingValuesModalOpen(true);
            }
          });

          if (selectedColIds.length === 2)
          {
            menuOptions.push({
              id: "correlationCoefficient",
              label: "Calculate correlation coefficient",
              handler: () => {
                const variableIds: number[] = [];
                variables.forEach((v, idx) => {if (selectedColIds.includes(getColNameFromVarName(v.name))) variableIds.push(idx)});
                setCorrelationVariableIds(variableIds);
                setCorrelationModalOpen(true);
              }
            });
          }

            if (selectedColIds.length === 2)
              menuOptions.push({
                id: "calcStatSignificance",
                label: "Calculate statistical significance",
                handler: () => {
                  const _variables = variables.filter(v => selectedColIds.includes(getColNameFromVarName(v.name)));
  
                  const data = new URLSearchParams();
                  const idsToRemove: number[] = []
                  _variables[0].values.forEach((v, idx) => {if (v === undefined) idsToRemove.push(idx)})
                  _variables[1].values.forEach((v, idx) => {if (v === undefined) idsToRemove.push(idx)})

                  if (_variables[0].type === VariableType.CATEGORICAL)
                    data.append('data_types[]', "categorical");
                  else
                    data.append('data_types[]', "numerical");

                  if (_variables[1].type === VariableType.CATEGORICAL)
                    data.append('data_types[]', "categorical");
                  else
                    data.append('data_types[]', "numerical");

                  var _values: any = []
                  _variables[0].values.forEach((v, i) => {if (!idsToRemove.includes(i)) _values.push(v)})
                  data.append('data[]', _values.toString().substring(0, _values.toString().length - 1));
                  
                  _values = []
                  _variables[1].values.forEach((v, i) => {if (!idsToRemove.includes(i)) _values.push(v)})
                  data.append('data[]', _values.toString().substring(0, _values.toString().length - 1));
  
                  const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: data.toString()
                  };
  
                  fetch(serverAddress + "/api/statistical_significance_test/", requestOptions)
                      .then(response => {
                        if (!response.ok) {
                          throw new Error(`Server responded with status ${response.status}`);
                        }
                        return response.json();
                      })
                      .then(response => {
                        setResultDescription("Calculated statistical significance")
                        setResult(["stat = " + response.data["statistic"].toFixed(2), "p-val = " + response.data["p_value"].toFixed(2)])
                        setResultModalOpen(true);
                      })
                      .catch(error => {
                        showWarning(`Error with calculation`);
                      });
  
                }
              });
          

          // NUMERICAL VARIABLES ONLY
          if (variables.filter(v => selectedColIds.includes(getColNameFromVarName(v.name)) && v.type === VariableType.CATEGORICAL).length === 0)
          {
    
            menuOptions.push({
              id: "removeOutliers",
              label: "Remove outlier values",
              handler: () => {
                const _variables = variables.filter(v => selectedColIds.includes(getColNameFromVarName(v.name)));
                const results: any[] = new Array(_variables.length);
                const promises: any[] = new Array(_variables.length);
              
                _variables.forEach((v, idx) => {
                  const data = new URLSearchParams();
                  v.values.forEach(v2 => data.append('data[]', String(v2 === undefined ? null : v2)));
                  const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: data.toString()
                  };
              
                  promises[idx] = fetch(serverAddress + "/api/replace_outliers/", requestOptions)
                    .then(response => {
                      if (!response.ok) {
                        throw new Error(`Server responded with status ${response.status}`);
                      }
                      return response.json();
                    })
                    .then(response => {
                      results[idx] = { var: v, data: response };
                    })
                    .catch(error => {
                      showWarning(`Error processing variable ${v.name}: ${error.message}`);
                      results[idx] = { var: v, data: { data: v.values.map(() => undefined) } }; // Fallback to undefined
                    });
                });
              
                Promise.all(promises)
                  .then(() => {
                    results.forEach(r => {
                      r.var.values = r.data.data.map((v: string) => v === "nan" ? undefined : v);
                    });
                    updateSpreadsheet(variables);
                  })
                  .catch(error => {
                    showWarning(`An error occurred while processing the data: ${error.message}`);
                  });
              }
            });

            menuOptions.push({
              id: "normalTest",
              label: "Distribution normality test",
              handler: () => {
                const _variables = variables.filter(v => selectedColIds.includes(getColNameFromVarName(v.name)));
                const results: any[] = new Array(_variables.length);
                const promises: any[] = new Array(_variables.length);
              
                _variables.forEach((v, idx) => {
                  const data = new URLSearchParams();
                  v.values.forEach(v2 => {if (v2 !== undefined) data.append('data[]', String(v2))});
                  const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: data.toString()
                  };
              
                  promises[idx] = fetch(serverAddress + "/api/normal_test/", requestOptions)
                    .then(response => {
                      if (!response.ok) {
                        throw new Error(`Server responded with status ${response.status}`);
                      }
                      return response.json();
                    })
                    .then(response => {
                      results[idx] = { var: v, data: response };
                    })
                    .catch(error => {
                      showWarning(`Error processing variable ${v.name}: ${error.message}`);
                      results[idx] = { var: v, data: undefined }; // Fallback to undefined
                    });
                });
              
                Promise.all(promises)
                  .then(() => {
                    console.log(results)
                    var res: string[] = [];
                    results.forEach(r => {
                      res.push(r.var.name + ": stat=" + r.data["data"]["statistic"].toFixed(2) + ", p-val=" + r.data["data"]["p_value"].toFixed(2))
                    });
                    setResultDescription("Normality test value:");
                    setResult(res);
                    setResultModalOpen(true);
                  })
                  .catch(error => {
                    showWarning(`An error occurred while processing the data: ${error.message}`);
                  });
              }
            });
            
            
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

  return variables.length !== 0 ? 
      <div  style={{backgroundColor: "white", maxWidth: "100%", maxHeight : "90vh", display: "inline-block", padding: 3, marginBottom: 5, overflowX : "auto", overflowY : "auto"}}>
        <ReactGrid 
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
    </div> : <div></div>
}