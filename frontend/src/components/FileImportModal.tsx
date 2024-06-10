import * as React from "react";
import PureModal from 'react-pure-modal';
import { showWarning } from "./Notifications";
import { Variable, VariableType } from "../classes/Variable"
import { useState } from 'react';

interface FileImportModalProps {
    isFileImportModalOpen: boolean;
    setFileImportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateSpreadsheet: (_variables: Variable[], _variableValuesLength: number, _timestamps: string[]) => void; 
    csvOutput: string;
}

export function FileImportModal({isFileImportModalOpen, setFileImportModalOpen, updateSpreadsheet, csvOutput} : FileImportModalProps) {
    const [isFileImportModalOpen2, setFileImportModalOpen2] = React.useState<boolean>(false);
    const [selectedSeparator, setSelectedSeparator] = React.useState(';');
    const [selectedDecimalSeparator, setSelectedDecimalSeparator] = React.useState(',');
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    var [variables, setVariables] = React.useState<Variable[]>([]);
    var [variableValuesLength, setvariableValuesLength] = React.useState<number>(0);
    var [timestamps, setTimestamps] = React.useState<string[]>([]);
    var [caseIds, setCaseIds] = React.useState<string[]>([]);
    const [rangeFrom, setRangeFrom] = useState('');
    const [rangeTo, setRangeTo] = useState('');
    return <div>
        <PureModal
            header="CSV import"
            footer=""
            isOpen={isFileImportModalOpen}
            closeButton="✕"
            closeButtonPosition="header"
            onClose={() => {
                setFileImportModalOpen(false);
                return true;
            }}
        >
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
        Data separator
        <select value = {selectedSeparator} onChange={e => setSelectedSeparator(e.target.value)} style={{marginBottom : 7}}>
            <option value=";">;</option>
            <option value=",">,</option>
            <option value=".">.</option>
            <option value="|">|</option>
            <option value="\t">tab</option>
        </select>
        <br></br>
        Decimal separator
        <select value = {selectedDecimalSeparator} onChange={e => setSelectedDecimalSeparator(e.target.value)} style={{marginBottom : 25}}>
            <option value=",">,</option>
            <option value=".">.</option>
        </select>
        <br></br>
        <input 
  style={{marginBottom : 12}}
  type="button" 
  value="Next" 
  className="bu-button bu-is-light bu-is-normal" 
  onClick={(e) => {
    // Check if selected separator is the same as the decimal separator
    if (selectedSeparator === selectedDecimalSeparator) {
      showWarning("Separator can't be the same as decimal separator.");
      return;
    }

    // Check if csvOutput is empty
    if (!csvOutput) {
      showWarning("CSV file is empty.");
      return;
    }

    // Extract CSV header
    const csvHeader = csvOutput.slice(0, csvOutput.indexOf("\n")).split(selectedSeparator);
    if (csvHeader.length < 3) {
      showWarning("CSV header is malformed or separator is incorrect.");
      return;
    }

    const _variables: Variable[] = [];
    const isNumber: boolean[] = [];
    for (let i = 2; i < csvHeader.length; i++) {
      _variables.push({
        name: csvHeader[i].replaceAll("\n", "").replaceAll("\r", ""), 
        type: VariableType.CATEGORICAL, 
        values: []
      });
      isNumber.push(true);
    }

    const csvRows = csvOutput.slice(csvOutput.indexOf("\n") + 1).split("\n");
    let _variableValuesLength = csvRows.length;
    const _timestamps: string[] = [];
    for (let i = 0; i < csvRows.length; i++) {
      const _values = csvRows[i].split(selectedSeparator);

      // Check if row is empty
      if (_values.length === 1 && _values[0] === '') {
        _variableValuesLength--;
        break;
      }

      // Check if the number of columns in row matches the header
      if (_values.length !== csvHeader.length) {
        showWarning(`Row ${i + 1} does not match the header format.`);
        return;
      }

      _timestamps.push(_values[1]);
      for (let j = 2; j < _values.length; j++) {
        if (isNaN(Number(_values[j].replace(selectedDecimalSeparator, ".")))) {
          isNumber[j - 2] = false;
        }
        (_variables[j - 2].values as (string | undefined)[]).push(_values[j] === "" ? undefined : _values[j]);
      }
    }

    for (let i = 0; i < isNumber.length; i++) {
      if (isNumber[i]) {
        if (new Set(_variables[i].values as string[]).size <= Math.min(_variables[i].values.length, 300) / 30) {
          continue;
        }
        _variables[i].type = VariableType.NUMERICAL;
        _variables[i].values = _variables[i].values.map((v) => v === undefined ? undefined : Number((v as string).replace(selectedDecimalSeparator, ".")));
      }
    }

    // Set state with the parsed data
    setVariables(_variables);
    setvariableValuesLength(_variableValuesLength);
    setTimestamps(_timestamps);
    setSelectedIds(Array.from(new Set(caseIds)));
    setFileImportModalOpen(false);
    setFileImportModalOpen2(true);
  }}
/>
        </div>
        </PureModal>
        <PureModal
            header="CSV import"
            footer=""
            isOpen={isFileImportModalOpen2}
            closeButton="✕"
            closeButtonPosition="header"
            onClose={() => {
                setFileImportModalOpen2(false);
                return true;
            }}
        >
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
        Select IDs to import
        <select style={{height: 300}} value={selectedIds} multiple onChange={event => 
        {
            const selectedValues = Array.from(event.target.selectedOptions, option => option.value);
            setSelectedIds(selectedValues);} 
        }>
            {!variables[0] ? "" : variables[0].values.map((_, i) => (
                <option value={i}>{i+1}</option>
            ))}
        </select>
        <input 
    style={{margin: 5, marginTop: 20}} 
    type="button" 
    className="bu-button bu-is-light bu-is-normal" 
    value="Select all" 
    onClick={() => {
      if (variables[0]) {
        const allIds = variables[0].values.map((_, i) => String(i));
        setSelectedIds(allIds);
      }
    }}
  />

<input 
  style={{ margin: 5, marginTop: 7 }} 
  type="button" 
  className="bu-button bu-is-light bu-is-normal" 
  value="Deselect all" 
  onClick={() => {
    setSelectedIds([]);
  }}
/>
  <div style={{ width : "auto", height : "0.15em", backgroundColor : "#eeeeee", margin : 5}}></div>
    <div style={{ display: 'flex', alignItems: 'center' , marginTop : 5, marginBottom : 5}}>
    <input
      style={{ margin: 5, marginTop : 0, marginBottom : 0 ,width : "50%", height: "2.9em"}}
      type="number"
      min={1}
      onChange={(e) => {
        setRangeFrom(e.target.value);
      }}
    />
    <input
      style={{ margin: 5 , marginTop : 0, marginBottom : 0, width : "50%", height: "2.9em"}}
      type="number"
      min={1}
      onChange={(e) => {
        setRangeTo(e.target.value);
      }}
    />

  </div>
  <input
  style={{ margin: 5}}
  type="button"
  className="bu-button bu-is-light bu-is-normal"
  value=" Add range "
  onClick={() => {
    var from = parseInt(rangeFrom);
    var to = parseInt(rangeTo);
    const maxAvailableValue = variables[0] ? variables[0].values.length - 1 : 0; 
    if (!isNaN(from) && !isNaN(to) && from >= 1 && to - 1 <= maxAvailableValue && from <= to) { 
        to -=1
        from -= 1
      const rangeIds = Array.from(Array(to - from + 1).keys()).map(num => String(num + from));
      setSelectedIds(prevIds => [...new Set([...prevIds, ...rangeIds])]);
    } else {
      showWarning("Please enter valid numbers for the range.");
    }
  }}
/>
  <input 
  style={{ margin: 5} }
  type="button" 
  className="bu-button bu-is-light bu-is-normal" 
  value="Remove range" 
  onClick={() => {
    var from = parseInt(rangeFrom);
    var to = parseInt(rangeTo);
    const maxAvailableValue = variables[0] ? variables[0].values.length - 1 : 0; 
    if (!isNaN(from) && !isNaN(to)&& from >= 1 && to - 1 <= maxAvailableValue && from <= to) { 
        to -=1
        from -= 1
      const rangeIdsToRemove = Array.from(Array(to - from + 1).keys()).map(num => String(num + from));
      setSelectedIds(prevIds => prevIds.filter(id => !rangeIdsToRemove.includes(id)));
    } else {
      showWarning("Please enter valid numbers for the range.");
    }
  }}
/>
<div style={{ width : "auto", height : "0.15em", backgroundColor : "#eeeeee", margin : 5}}></div>
        <input style={{margin: 5}} type="button" className="bu-button bu-is-light bu-is-normal" value="Import" onClick={(e) => {
            if (selectedIds.length == 0)
                {
                    showWarning("Can't import empty data.");
                    return;
                }
            const _timestamps = timestamps.filter((_, index) => selectedIds.includes(String(index)));
            const _variables = variables.map(variable => {
                let updatedValues;
                if (variable.type === VariableType.CATEGORICAL) {
                    updatedValues = (variable.values as (string | undefined)[])
                        .filter((_, index) => selectedIds.includes(String(index)));
                } else {
                    updatedValues = (variable.values as (number | undefined)[])
                        .filter((_, index) => selectedIds.includes(String(index)));
                }
                return new Variable(variable.name, variable.type, updatedValues);
            });
            const _variableValuesLength = _variables[0].values.length;
            updateSpreadsheet(_variables, _variableValuesLength, _timestamps );
            setFileImportModalOpen2(false);
        }}></input>
        </div>
        </PureModal>
    </div>
}