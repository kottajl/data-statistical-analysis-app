import * as React from "react";
import PureModal from 'react-pure-modal';
import { showWarning } from "./Notifications";
import { Variable, VariableType } from "../classes/Variable"

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
    return  <PureModal
            header="CSV Export"
            footer=""
            isOpen={isFileExportModalOpen}
            closeButton="X"
            closeButtonPosition="header"
            onClose={() => {
                setFileExportModalOpen(false);
                return true;
            }}
        >
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
        Separator
        <select value = {selectedSeparator} onChange={e => setSelectedSeparator(e.target.value)}>
            <option value=";">;</option>
            <option value=",">,</option>
            <option value=".">.</option>
            <option value="|">|</option>
            <option value="\t">tab</option>
        </select>
        <br></br>
        Decimal separator
        <select value = {selectedDecimalSeparator} onChange={e => setSelectedDecimalSeparator(e.target.value)}>
            <option value=",">,</option>
            <option value=".">.</option>
        </select>
        <br></br>
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
        Select variables to export
        <select style={{height: 300}} value={selectedVariables} multiple onChange={event => 
        {
            const selectedValues = Array.from(event.target.selectedOptions, option => option.value);
            setSelectedVariables(selectedValues);} 
        }>
            {variables.map(v => (
                <option value={v.name}>{v.name}</option>
            ))}
        </select>
        <input style={{margin: 5}} type="button" className="bu-button bu-is-light bu-is-normal" value="Export" onClick={(e) => {
            if (variables.length === 0 || selectedIds.length === 0 || timestamps.length === 0)
            {
                showWarning("No data to export!");
                return;
            }
            if (selectedSeparator === selectedDecimalSeparator)
            {
                showWarning("Separator can't be the same as decimal separator!");
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

            var fileContent = "ID;Timestamp;";
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
        </PureModal>
}