import * as React from "react";
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import { Variable, VariableType } from "../classes/Variable"


export function TopMenu({ updateSpreadsheet }: { updateSpreadsheet: (_variables: Variable[], _variableValuesLength: number, _timestamps: string[], _caseIds: string[]) => void }) {
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
            (_variables[j - 2].values as (string | undefined)[]).push(_values[j] === "" ? undefined : _values[j]);
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

  const onInputClick = (event: any) => {
    event.target.value = ''
  }

  return <div className="box" style={{padding: 3, marginBottom: 5}}>
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
        onClick={onInputClick}
    />
    </div>
}