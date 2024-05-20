import * as React from "react";
import PureModal from 'react-pure-modal';
import { showWarning } from "./Notifications";
import { Variable, VariableType } from "../classes/Variable"

interface FileExportModalProps {
    isFileExportModalOpen: boolean;
    setFileExportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    variables: Variable[];
    timestamps: string[];
    caseIds: string[];
}

export function FileExportModal({isFileExportModalOpen, setFileExportModalOpen, variables, timestamps, caseIds} : FileExportModalProps) {
    const [selectedSeparator, setSelectedSeparator] = React.useState(';');
    const [selectedDecimalSeparator, setSelectedDecimalSeparator] = React.useState(',');
    const [selectedCaseIds, setSelectedCaseIds] = React.useState<string[]>([]);
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
        Select case IDs to export
        <select style={{height: 300}} value={selectedCaseIds} multiple onChange={event => 
        {
            const selectedValues = Array.from(event.target.selectedOptions, option => option.value);
            setSelectedCaseIds(selectedValues);} 
        }>
            {Array.from(new Set(caseIds)).map(caseId => (
                <option value={caseId}>Case {caseId}</option>
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
        <input style={{margin: 5}} type="button" value="Export" onClick={(e) => {
            if (variables.length === 0 || caseIds.length === 0 || timestamps.length === 0)
            {
                showWarning("No data to export!");
                return;
            }
            if (selectedSeparator === selectedDecimalSeparator)
            {
                showWarning("Separator can't be the same as decimal separator!");
                return;
            }
            const indexesToRemove: number[] = []
            caseIds.forEach((c, idx) => {
                if (!selectedCaseIds.includes(c))
                    indexesToRemove.push(idx);
            });
            const _timestamps = timestamps.filter((_, index) => !indexesToRemove.includes(index));
            const _caseIds = caseIds.filter((_, index) => !indexesToRemove.includes(index));
            var _variables = variables.map(variable => {
                let updatedValues;
                if (variable.type === VariableType.CATEGORICAL) {
                    updatedValues = (variable.values as (string | undefined)[])
                        .filter((_, index) => !indexesToRemove.includes(index));
                } else {
                    updatedValues = (variable.values as (number | undefined)[])
                        .filter((_, index) => !indexesToRemove.includes(index));
                }
                return new Variable(variable.name, variable.type, updatedValues);
            });

            _variables = _variables.filter(v => selectedVariables.includes(v.name));

            var fileContent = "ID;Timestamp;";
            _variables.forEach(v => fileContent += v.name + selectedSeparator);
            fileContent += "Case ID\n";

            for (let i = 0; i < _timestamps.length; i++)
            {
                fileContent += String(i+1) + selectedSeparator + _timestamps[i] + selectedSeparator;
                _variables.forEach(v => fileContent += v.values[i] === undefined ? selectedSeparator : v.type === VariableType.CATEGORICAL ? v.values[i] + selectedSeparator : String(v.values[i]).replaceAll(".", selectedDecimalSeparator) + selectedSeparator);
                fileContent += _caseIds[i] + "\n";
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