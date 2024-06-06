import * as React from "react";
import PureModal from 'react-pure-modal';
import { showWarning } from "./Notifications";
import { Variable, VariableType } from "../classes/Variable"

interface CorrelationModalProps {
    isCorrelationModalOpen: boolean;
    setCorrelationModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setResultModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setResult: React.Dispatch<React.SetStateAction<any[]>>;
    setResultDescription: React.Dispatch<React.SetStateAction<string>>;
    variables: Variable[];
    variableIds: number[];
    serverAddress: string;
}

export function CorrelationModal({isCorrelationModalOpen, setCorrelationModalOpen, setResultModalOpen, setResult, setResultDescription, variables, variableIds, serverAddress} : CorrelationModalProps) {
  const [selectedType, setSelectedType] = React.useState("");
  const [varTypes, setVarTypes] = React.useState("");

  React.useEffect(() => {
    const _variables = variables.filter((v, idx) => variableIds.includes(idx));
    if (_variables.length === 0)
        return
    if (_variables[0].type === VariableType.NUMERICAL && _variables[1].type === VariableType.NUMERICAL)
    {
        setSelectedType("pearsonr");
        setVarTypes("nn");
    }
    else if (_variables[0].type === VariableType.CATEGORICAL && _variables[1].type === VariableType.CATEGORICAL)
    {
        setSelectedType("chisquare");
        setVarTypes("cc");
    }
    else
    {
        setSelectedType("f_oneway");
        setVarTypes("nc");
    }
}, [variables, variableIds]);
      
  return <PureModal
        header="Correlation coefficient"
        footer=""
        isOpen={isCorrelationModalOpen}
        closeButton="X"
        closeButtonPosition="header"
        onClose={() => {
            setCorrelationModalOpen(false);
            return true;
        }}
    >
    <div>
    <p>Correlation coefficient</p>
        <select value = {selectedType} onChange={e => setSelectedType(e.target.value)}>
            <option style = {{display: varTypes === "nn" ? "block": "none"}} value="pearsonr">Pearson</option>
            <option style = {{display: varTypes === "nn" ? "block": "none"}} value="spearmanr">Spearman</option>
            <option style = {{display: varTypes === "cc" ? "block": "none"}} value="chisquare">Chi-square</option>
            <option style = {{display: varTypes === "nc" ? "block": "none"}} value="f_oneway">One-way ANOVA</option>
        </select>
        <p><input style={{margin: 5}} type="button" className="bu-button bu-is-light bu-is-normal" value="Calculate" onClick={(e) => {
            const _variables = variables.filter((v, idx) => variableIds.includes(idx));

            if (varTypes === "nc" && _variables[0].type === VariableType.CATEGORICAL)
            {
                var tmp = _variables[0];
                _variables[0] = _variables[1];
                _variables[1] = tmp;
            }

            const idsToRemove: number[] = []
            _variables[0].values.forEach((v, idx) => {if (v === undefined || v === "") idsToRemove.push(idx)})
            _variables[1].values.forEach((v, idx) => {if (v === undefined || v === "") idsToRemove.push(idx)})

            const data = new URLSearchParams();
            var _values: any = []
            _variables[0].values.forEach((v, i) => {if (!idsToRemove.includes(i)) _values.push(v)})
            data.append('data[]', _values.toString().substring(0, _values.toString().length - 1));
            
            _values = []
            _variables[1].values.forEach((v, i) => {if (!idsToRemove.includes(i)) _values.push(v)})
            data.append('data[]', _values.toString().substring(0, _values.toString().length - 1));

            data.append('functions[]', selectedType);

            if (varTypes === "nn")
            {
                data.append('data_types[]', "numerical");
                data.append('data_types[]', "numerical");
            }
            else if (varTypes === "cc")
            {
                data.append('data_types[]', "categorical");
                data.append('data_types[]', "categorical");
            }
            else
            {
                data.append('data_types[]', "numerical");
                data.append('data_types[]', "categorical");
            }

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: data.toString()
            };
            fetch(serverAddress + "/api/2d_stats/", requestOptions)
                .then((response) => {
                if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                }
                return response.json();
                })
                .then((response) => { 
                    console.log(response);
                    setResult([response[selectedType].toFixed(2)]);
                })
                .catch((error) => {
                    showWarning(`Error calculating`);
                    setResult([]);
                });
            
            setResultDescription("Calculated coefficient:");
            setCorrelationModalOpen(false);
            setResultModalOpen(true);
        }}></input></p>
    </div>
    </PureModal>
}