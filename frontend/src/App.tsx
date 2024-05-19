import * as React from "react";
import { ReactGrid, Column, Row, CellChange, TextCell, DefaultCellTypes, Id, MenuOption, CellLocation, SelectionMode } from "@silevis/reactgrid";
import { ToastContainer, toast } from 'react-toastify';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import PureModal from 'react-pure-modal';
import 'react-pure-modal/dist/react-pure-modal.min.css';
import '@szhsin/react-menu/dist/index.css';
import "@silevis/reactgrid/styles.css";
import 'react-toastify/dist/ReactToastify.css';
//import 'bulma/css/bulma.min.css';

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

/*const getVariables = (): Variable[] => [
  {name: "var1", type: VariableType.CATEGORICAL, values: ["a","b",undefined,"d","e",undefined,"g","h"]},
  {name: "var2", type: VariableType.NUMERICAL, values: [0,1,2,3,undefined,4,5,6,7]},
  {name: "var3", type: VariableType.CATEGORICAL, values: ["a","d","5","d","e",undefined,"g","h"]},
  {name: "var4", type: VariableType.NUMERICAL, values: [0,1,2,3,undefined,4,5,6,7,5,5,6,7,8,9,9,9,9]}
];*/

function getColNameFromVarName(_var: string): string 
{
  return "col_" + _var;
}

const getColumns = (variables: Variable[]): Column[] => [
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

const getRows = (variables: Variable[], numValues: number, timestamps: string[], caseIds: string[]): Row[] => [
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
  var [variableValuesLength, setvariableValuesLength] = React.useState<number>(0);
  var [variables, setVariables] = React.useState<Variable[]>([]);
  var [timestamps, setTimestamps] = React.useState<string[]>([]);
  var [caseIds, setCaseIds] = React.useState<string[]>([]);
  var [columns, setColumns] = React.useState<Column[]>([]);
  var [rows, setRows] = React.useState<Row[]>([]);
  var [isStatModalOpen, setStatModalOpen] = React.useState<boolean>(false);
  var [isStatResultModalOpen, setStatResultModalOpen] = React.useState<boolean>(false);
  var [selectedColIds, setSelectedColIds] = React.useState<Id[]>([]);

  const serverAddress = "http://127.0.0.1:8000";

  const updateSpreadsheet = (_variables: Variable[], _variableValuesLength: number=variableValuesLength, _timestamps: string[]=timestamps, _caseIds: string[]=caseIds) =>
  {
    setVariables(_variables);
    setvariableValuesLength(_variableValuesLength);
    setTimestamps(_timestamps);
    setCaseIds(_caseIds);
    setColumns(getColumns(_variables));
    setRows(getRows(_variables, _variableValuesLength, _timestamps, _caseIds));
  }
  
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
      if (variables.filter(v => selectedColIds.includes(getColNameFromVarName(v.name)) && v.type === VariableType.CATEGORICAL).length == 0)
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
          const new_val = +change.newCell.text as number
          if (!isNaN(new_val))
            _var.values[change.rowId as number] = new_val
          else
            showWarning("Value is not a number!")
        }
        else if (_var.type === VariableType.CATEGORICAL) 
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

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    const separator: string = ";";
    const decimalSeparator: string = ",";

    const fileReader = new FileReader();
    fileReader.onload = function (event: ProgressEvent<FileReader>) {
      if (!event.target)
        return;
      const csvOutput = event.target?.result as string;

      const _variables: Variable[] = []
      const isNumber: boolean[] = []
      const csvHeader = csvOutput.slice(0, csvOutput.indexOf("\n")).split(separator);
      for (let i = 2; i < csvHeader.length - 1; i++) 
      {
        _variables.push({name: csvHeader[i], type: VariableType.CATEGORICAL, values: []});
        isNumber.push(true);
      }
      
      const csvRows = csvOutput.slice(csvOutput.indexOf("\n") + 1).split("\n");
      var _variableValuesLength = csvRows.length;
      const _timestamps: string[] = []
      const _caseIds: string[] = []
      for (let i = 0; i < csvRows.length; i++) {
        const _values = csvRows[i].split(separator);
        if (_values.length === 1 && _values[0] === '')
        {
          _variableValuesLength--;
          break;
        }
        for (let j = 2; j < _values.length - 1; j++) 
        {
          if (isNaN(Number(_values[j].replace(decimalSeparator, "."))))
            isNumber[j-2] = false;
          (_variables[j - 2].values as (string | undefined)[]).push(_values[j]);
        }
        _timestamps.push(_values[1]);
        _caseIds.push(_values[_values.length - 1]);
      }
      for (let i = 0; i < isNumber.length; i++)
        if (isNumber[i])
        {
          if (new Set(_variables[i].values as string[]).size <= Math.min(_variables[i].values.length,300) / 30)
            continue
          _variables[i].type = VariableType.NUMERICAL;
          _variables[i].values = _variables[i].values.map((v) => v === undefined ? undefined : Number((v as string).replace(decimalSeparator, ".")))
        }
      //console.log(variableValuesLength)
      updateSpreadsheet(_variables, _variableValuesLength, _timestamps, _caseIds);
    };
    const file = event.target.files?.[0];
    if (file) 
      fileReader.readAsText(file);
  };

  const [selMean, setSelMean] = React.useState(false);
  const [selMedian, setSelMedian] = React.useState(false);
  const [selMode, setSelMode] = React.useState(false);
  const [selStd, setSelStd] = React.useState(false);
  const [selMin, setSelMin] = React.useState(false);
  const [selMax, setSelMax] = React.useState(false);
  const [selUnique, setSelUnique] = React.useState(false);
  const [selIqr, setSelIqr] = React.useState(false);
  const [selSkew, setSelSkew] = React.useState(false);
  const [selKurtosis, setSelKurtosis] = React.useState(false);
  const [selPercentile, setSelPercentile] = React.useState(false);
  const [selMissing, setSelMissing] = React.useState(false);

  return <div style={{paddingRight: 10, paddingLeft: 10, paddingTop:5}}>
    <div className="box" style={{padding: 3, marginBottom: 5}}>
      <Menu menuButton={<MenuButton className="button is-light is-normal">File</MenuButton>} menuClassName="fileMenu">
        <MenuItem onClick={handleImportClick}>Import</MenuItem>
        <MenuItem>Export</MenuItem>
      </Menu>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{display: 'none'}}
        onChange={handleFileChange}
      />
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
      stickyLeftColumns={1}
    />
    <ToastContainer/>
    <PureModal
      header="Calculate statistics"
      footer=""
      isOpen={isStatModalOpen}
      closeButton="X"
      closeButtonPosition="header"
      onClose={() => {
        setStatModalOpen(false);
        return true;
      }}
    >
    <form style={{display: 'flex', flexDirection: 'column'}}>
          <label style={{margin: 5}}><input type="checkbox" checked={selMean} onChange={() => setSelMean(!selMean)}/> Mean</label>
          <label style={{margin: 5}}><input type="checkbox" checked={selMedian} onChange={() => setSelMedian(!selMedian)}/> Median</label>
          <label style={{margin: 5}}><input type="checkbox" checked={selMode} onChange={() => setSelMode(!selMode)}/> Mode</label>
          <label style={{margin: 5}}><input type="checkbox" checked={selStd} onChange={() => setSelStd(!selStd)}/> Std</label>
          <label style={{margin: 5}}><input type="checkbox" checked={selMin} onChange={() => setSelMin(!selMin)}/> Min</label>
          <label style={{margin: 5}}><input type="checkbox" checked={selMax} onChange={() => setSelMax(!selMax)}/> Max</label>
          <label style={{margin: 5}}><input type="checkbox" checked={selUnique} onChange={() => setSelUnique(!selUnique)}/> Unique</label>
          <label style={{margin: 5}}><input type="checkbox" checked={selIqr} onChange={() => setSelIqr(!selIqr)}/> Iqr</label>
          <label style={{margin: 5}}><input type="checkbox" checked={selSkew} onChange={() => setSelSkew(!selSkew)}/> Skew</label>
          <label style={{margin: 5}}><input type="checkbox" checked={selKurtosis} onChange={() => setSelKurtosis(!selKurtosis)}/> Kurtosis</label>
          <label style={{margin: 5}}><input type="checkbox" checked={selPercentile} onChange={() => setSelPercentile(!selPercentile)}/> Percentile</label>
          <label style={{margin: 5}}><input type="checkbox" checked={selMissing} onChange={() => setSelMissing(!selMissing)}/> Missing</label>
          <input style={{margin: 5}} type="button" value="Calculate" onClick={(e) => {
            variables.filter((v) => selectedColIds.includes(getColNameFromVarName(v.name))).forEach( v =>
              {
                const data = new URLSearchParams();
                if (selMean)
                  data.append('functions[]', "mean")
                if (selMedian)
                  data.append('functions[]', "median")
                if (selMode)
                  data.append('functions[]', "mode")
                if (selStd)
                  data.append('functions[]', "std")
                if (selMin)
                  data.append('functions[]', "min")
                if (selMax)
                  data.append('functions[]', "max")
                if (selUnique)
                  data.append('functions[]', "unique")
                if (selIqr)
                  data.append('functions[]', "iqr")
                if (selSkew)
                  data.append('functions[]', "skew")
                if (selKurtosis)
                  data.append('functions[]', "kurtosis")
                if (selPercentile)
                  data.append('functions[]', "precentile")
                if (selMissing)
                  data.append('functions[]', "missing")
                
                v.values.forEach( v2 => data.append('data[]', String(v2 === undefined ? null : v2)))
  
                const requestOptions = {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: data.toString()
                };
  
                fetch(serverAddress+"/api/1d_stats/", requestOptions)
                  .then(response => response.json())
                  .then(response => console.log(response));
              });
          }}/>
      </form>
    </PureModal>
  </div>
  }; 
export default App;