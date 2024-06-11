import * as React from "react";
import PureModal from 'react-pure-modal';
import { showWarning } from "./Notifications";
import { Variable, VariableType } from "../classes/Variable"

interface MissingValuesModalProps {
    isMissingValuesModalOpen: boolean;
    setMissingValuesModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    variables: Variable[];
    variableIds: number[];
    updateSpreadsheet: (_variables: Variable[]) => void; 
    serverAddress: string;
}

export function MissingValuesModal({isMissingValuesModalOpen, setMissingValuesModalOpen, variables, variableIds, updateSpreadsheet, serverAddress} : MissingValuesModalProps) {
    const [selectedStrategy, setSelectedStrategy] = React.useState("before_nan");
    const [selectedConstant, setSelectedConstant] = React.useState(0);
    const [onlyNumericalVariables, setOnlyNumericalVariables] = React.useState(true);

    React.useEffect(() => {
      const _variables = variables.filter((v, idx) => variableIds.includes(idx));
      const hasCategorical = _variables.some(v => v.type === VariableType.CATEGORICAL);
      setOnlyNumericalVariables(!hasCategorical);
  }, [variables, variableIds]);

    return  <PureModal
            header="Fill missing values"
            footer=""
            isOpen={isMissingValuesModalOpen}
            closeButton="✕"
            closeButtonPosition="header"
            onClose={() => {
                setMissingValuesModalOpen(false);
                return true;
            }}
        >
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                Strategy
                <select value = {selectedStrategy} onChange={e => setSelectedStrategy(e.target.value)}>
                    <option value="mean" style = {{display: onlyNumericalVariables ? "block": "none"}}>Mean</option>
                    <option value="median" style = {{display: onlyNumericalVariables ? "block": "none"}}>Median</option>
                    <option value="before_nan">Value before</option>
                    <option value="after_nan">Value after</option>
                    <option value="constant">Constant</option>
                </select>
                <br></br>
                <div style={{display: selectedStrategy === "constant" ? "block": "none"}}>Value</div>
                <input style={{display: selectedStrategy === "constant" ? "block": "none"}} type="number" value = {selectedConstant} onChange={e => setSelectedConstant(Number(e.target.value))}/>
                <br style={{display: selectedStrategy === "constant" ? "block": "none"}}></br> 
                <input style={{marginTop: 17, marginBottom : 7}} type="button" className="bu-button bu-is-light bu-is-normal" value="Fill" onClick={(e) => {   
                    const _variables = variables.filter((v, idx) => variableIds.includes(idx));
                    const results: any[] = new Array(_variables.length);
                    const promises: any[] = new Array(_variables.length);
                    _variables.forEach((v, idx) => {
                      const data = new URLSearchParams();
                      v.values.forEach(v2 => data.append('data[]', String(v2 === undefined || v2 === "" ? null : v2)));
                      data.append('method', selectedStrategy);
                      
                      if (selectedStrategy === "constant") {
                        data.append('constant', String(selectedConstant));
                      }
                    
                      const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: data.toString()
                      };
                    
                      promises[idx] = fetch(serverAddress + "/api/missing_values/", requestOptions)
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

                    Promise.all(promises).then(r => {
                        //console.log(results);
                        results.forEach(r => r.var.values = r.data.data.map((v: string) => v  === "nan" ? undefined : v));
                        updateSpreadsheet(variables);
                      });

                    updateSpreadsheet(variables);
                    setMissingValuesModalOpen(false);
            }}></input>
            </div>
        </PureModal>
}