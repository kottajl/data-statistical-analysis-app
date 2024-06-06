import * as React from "react";
import PureModal from 'react-pure-modal';
import { showWarning } from "./Notifications";
import { Variable, VariableType } from "../classes/Variable"
import { useState } from 'react';

interface FileExportModalProps {
    isFileExportModalOpen: boolean;
    setFileExportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    variables: Variable[];
    timestamps: string[];
}

export function FileExportModal({isFileExportModalOpen, setFileExportModalOpen, variables, timestamps} : FileExportModalProps) {
    const [selectedSeparator, setSelectedSeparator] = React.useState(';');
    const [selectedDecimalSeparator, setSelectedDecimalSeparator] = React.useState(',');
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    const [selectedVariables, setSelectedVariables] = React.useState<string[]>([]);
    const [rangeIdsFrom, setRangeIdsFrom] = useState('');
    const [rangeIdsTo, setRangeIdsTo] = useState('');
    const [rangeVariablesFrom, setRangeVariablesFrom] = useState('');
    const [rangeVariablesTo, setRangeVariablesTo] = useState('');
    return  <PureModal
            header="CSV Export"
            footer=""
            isOpen={isFileExportModalOpen}
            closeButton="X"
            closeButtonPosition="header"
            width="auto"
            onClose={() => {
                setFileExportModalOpen(false);
                return true;
            }}
        >
            <div style={{display: 'flex', flexDirection: 'row'}}>
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', margin : 10, width : "20%"}}>
        Separator
        <select value = {selectedSeparator} onChange={e => setSelectedSeparator(e.target.value)} style={{marginBottom : 10, height : "2.5em"}}>
            <option value=";">;</option>
            <option value=",">,</option>
            <option value=".">.</option>
            <option value="|">|</option>
            <option value="\t">tab</option>
        </select>
        <br></br>
        Decimal separator
        <select value = {selectedDecimalSeparator} onChange={e => setSelectedDecimalSeparator(e.target.value)} style={{height : "2.5em"}}>
            <option value=",">,</option>
            <option value=".">.</option>
        </select>
        <input style={{marginTop: 10, position: "fixed", bottom: 31, width : "auto", textAlign : "center", minWidth : 133}} type="button" className="bu-button bu-is-light bu-is-normal" value="Export" onClick={(e) => {
            if (variables.length === 0 || selectedIds.length === 0 || timestamps.length === 0)
            {
                showWarning("No data to export.");
                return;
            }
            if (selectedSeparator === selectedDecimalSeparator)
            {
                showWarning("Separator can't be the same as decimal separator.");
                return;
            }
            const _timestamps = timestamps.filter((_, index) => selectedIds.includes(String(index)));
            var _variables = variables.map(variable => {
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

            _variables = _variables.filter(v => selectedVariables.includes(v.name));

            if (_variables.length === 0)
                {
                    showWarning("No data to export.");
                    return;
                }

            var fileContent = "ID"  + selectedSeparator + "Timestamp" + selectedSeparator;
            for (let i = 0; i < _variables.length - 1; i++)
                fileContent += _variables[i].name + selectedSeparator
            fileContent += _variables[_variables.length - 1].name + "\n"

            for (let i = 0; i < _timestamps.length; i++)
            {
                fileContent += String(i+1) + selectedSeparator + _timestamps[i] + selectedSeparator;
                for (let j = 0; j < _variables.length; j++)
                {
                    let v = _variables[j]
                    if (v.values[i] !== undefined)
                        if (v.type === VariableType.CATEGORICAL)
                            fileContent += v.values[i]
                        else
                            fileContent += String(v.values[i]).replaceAll(".", selectedDecimalSeparator)
                    if (j != _variables.length - 1)
                        fileContent += selectedSeparator
                }
                fileContent += "\n"
            }

            const blob = new Blob([fileContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'output.csv';
            a.click();
            URL.revokeObjectURL(url);
        }}></input>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', margin : 10, width : "40%"}}>
        Select IDs to export
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
        setRangeIdsFrom(e.target.value);
      }}
    />
    <input
      style={{ margin: 5 , marginTop : 0, marginBottom : 0, width : "50%", height: "2.9em"}}
      type="number"
      min={1}
      onChange={(e) => {
        setRangeIdsTo(e.target.value);
      }}
    />

  </div>
  <input
  style={{ margin: 5}}
  type="button"
  className="bu-button bu-is-light bu-is-normal"
  value=" Add range "
  onClick={() => {
    var from = parseInt(rangeIdsFrom);
    var to = parseInt(rangeIdsTo);
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
    var from = parseInt(rangeIdsFrom);
    var to = parseInt(rangeIdsTo);
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
        </div>
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', margin : 10, width : "40%"}}>
        Select variables to export
        <select style={{height: 462}} value={selectedVariables} multiple onChange={event => 
        {
            const selectedValues = Array.from(event.target.selectedOptions, option => option.value);
            setSelectedVariables(selectedValues);} 
        }>
            {variables.map(v => (
                <option value={v.name}>{v.name}</option>
            ))}
        </select>
        <input 
    style={{margin: 5, marginTop: 20}} 
    type="button" 
    className="bu-button bu-is-light bu-is-normal" 
    value="Select all" 
    onClick={() => {
      if (variables[0]) {
        const allIds = variables.map((i, _) => String(i.name))
        console.log(allIds)
        setSelectedVariables(allIds);
      }
    }}
  />

<input 
  style={{ margin: 5, marginTop: 7 }} 
  type="button" 
  className="bu-button bu-is-light bu-is-normal" 
  value="Deselect all" 
  onClick={() => {
    setSelectedVariables([]);
  }}
/>

         </div>
        </div>
        </PureModal>
}