import * as React from "react";
import PureModal from 'react-pure-modal';
import { showWarning } from "./Notifications";
import { Variable, VariableType } from "../classes/Variable"

interface FileImportModalProps {
    isFileImportModalOpen: boolean;
    setFileImportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateSpreadsheet: (_variables: Variable[], _variableValuesLength: number, _timestamps: string[], _caseIds: string[]) => void; 
    csvOutput: string;
}

export function FileImportModal({isFileImportModalOpen, setFileImportModalOpen, updateSpreadsheet, csvOutput} : FileImportModalProps) {
    const [isFileImportModalOpen2, setFileImportModalOpen2] = React.useState<boolean>(false);
    const [selectedSeparator, setSelectedSeparator] = React.useState(';');
    const [selectedDecimalSeparator, setSelectedDecimalSeparator] = React.useState(',');
    const [selectedCaseIds, setSelectedCaseIds] = React.useState<string[]>([]);
    var [variables, setVariables] = React.useState<Variable[]>([]);
    var [variableValuesLength, setvariableValuesLength] = React.useState<number>(0);
    var [timestamps, setTimestamps] = React.useState<string[]>([]);
    var [caseIds, setCaseIds] = React.useState<string[]>([]);
    return <div>
        <PureModal
            header="CSV Import"
            footer=""
            isOpen={isFileImportModalOpen}
            closeButton="X"
            closeButtonPosition="header"
            onClose={() => {
                setFileImportModalOpen(false);
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
        <input style={{margin: 5}} type="button" value="Next" onClick={(e) => {
            if (selectedSeparator === selectedDecimalSeparator)
            {
                showWarning("Separator can't be the same as decimal separator!");
                return;
            }
        
              const _variables: Variable[] = []
              const isNumber: boolean[] = []
              const csvHeader = csvOutput.slice(0, csvOutput.indexOf("\n")).split(selectedSeparator);
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
                const _values = csvRows[i].split(selectedSeparator);
                if (_values.length === 1 && _values[0] === '')
                {
                  _variableValuesLength--;
                  break;
                }
                for (let j = 2; j < _values.length - 1; j++) 
                {
                  if (isNaN(Number(_values[j].replace(selectedDecimalSeparator, "."))))
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
                  _variables[i].values = _variables[i].values.map((v) => v === undefined ? undefined : Number((v as string).replace(selectedDecimalSeparator, ".")))
                }
            //console.log(variableValuesLength)
            setVariables(_variables);
            setvariableValuesLength(_variableValuesLength);
            setTimestamps(_timestamps);
            setCaseIds(_caseIds);
            setSelectedCaseIds(Array.from(new Set(caseIds)));
            setFileImportModalOpen(false);
            setFileImportModalOpen2(true);
        }}></input>
        </div>
        </PureModal>
        <PureModal
            header="CSV Import"
            footer=""
            isOpen={isFileImportModalOpen2}
            closeButton="X"
            closeButtonPosition="header"
            onClose={() => {
                setFileImportModalOpen2(false);
                return true;
            }}
        >
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
        Select case IDs to import
        <select style={{height: 300}} value={selectedCaseIds} multiple onChange={event => 
        {
            const selectedValues = Array.from(event.target.selectedOptions, option => option.value);
            setSelectedCaseIds(selectedValues);} 
        }>
            {Array.from(new Set(caseIds)).map(caseId => (
                <option value={caseId}>Case {caseId}</option>
            ))}
        </select>
        <input style={{margin: 5}} type="button" value="Import" onClick={(e) => {
            const indexesToRemove: number[] = []
            caseIds.forEach((c, idx) => {
                if (!selectedCaseIds.includes(c))
                    indexesToRemove.push(idx);
            });
            const _timestamps = timestamps.filter((_, index) => !indexesToRemove.includes(index));
            const _caseIds = caseIds.filter((_, index) => !indexesToRemove.includes(index));
            const _variables = variables.map(variable => {
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

            const _variableValuesLength = _variables[0].values.length;
            updateSpreadsheet(_variables, _variableValuesLength, _timestamps, _caseIds );
            //console.log(selectedCaseIds);
            setFileImportModalOpen2(false);
        }}></input>
        </div>
        </PureModal>
    </div>
}