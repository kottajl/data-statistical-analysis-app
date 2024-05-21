import * as React from "react";
import PureModal from 'react-pure-modal';
import { showWarning } from "./Notifications";
import { Variable, VariableType } from "../classes/Variable"

interface GraphModalProps {
    isGraphModalOpen: boolean;
    setGraphModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    serverAddress: string;
    variableIds: number[];
    variables: Variable[];
}

export function GraphModal({isGraphModalOpen, setGraphModalOpen, serverAddress, variableIds, variables} : GraphModalProps) {
    const [imageSrc, setImageSrc] = React.useState('');
    const [selectedType, setSelectedType] = React.useState('linear');
    var [isGraphModalOpen2, setGraphModalOpen2] = React.useState<boolean>(false);
      
  return  <div><PureModal
            header="Plot"
            footer=""
            isOpen={isGraphModalOpen}
            closeButton="X"
            closeButtonPosition="header"
            onClose={() => {
                setGraphModalOpen(false);
                return true;
            }}
        >
        <div>
            Plot type
            <select value = {selectedType} onChange={e => setSelectedType(e.target.value)}>
                <option value="linear">Linear plot</option>
                <option value="scatter">Scatter plot</option>
                {/*<option value="boxplot">Box plot</option>*/}
                <option value="hist">Histogram</option>
                <option value="bar">Bar chart</option>
                <option value="pie_chart">Pie chart</option>
            </select>
            <input style={{margin: 5}} type="button" value="Show" onClick={(e) => {
            const data = new URLSearchParams();
            const idsToRemove: number[] = []
            variableIds.forEach(i => {
                variables[i].values.forEach((v, idx) => {if (v === undefined) idsToRemove.push(idx)})
            })
            variableIds.forEach(i => {
                //console.log(variables[i].values.toString().substring(0, variables[i].values.toString().length - 1));
                //variables[i].values.forEach(v => data.append('data[]', String(v)));
                var _values: any = []
                variables[i].values.forEach((v, i) => {if (!idsToRemove.includes(i)) _values.push(v)})
                data.append('data[]', _values.toString().substring(0, variables[i].values.toString().length - 1));
                //data.append('data[]', '0')
                data.append('data_types[]', variables[i].type === VariableType.NUMERICAL ? "numerical" : "categorical");
                data.append('variable_names[]', variables[i].name);
                
            })
            data.append('plot_type', selectedType);
            data.append('ID_type', "numerical");
            variables[variableIds[0]].values.forEach((_, i) => {
                if (!idsToRemove.includes(i)) 
                {
                    console.log(i+1)
                    data.append('ID[]', String(i+1))
                }
            })
            //console.log(data.toString());
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: data.toString()
            };
        
            fetch(serverAddress+"/api/plots/1d/", requestOptions)
                        .then(response => response.blob())
                        .then(blob => setImageSrc(URL.createObjectURL(blob)));
            setGraphModalOpen(false);
            setGraphModalOpen2(true);
        }}></input>
        </div>
        </PureModal>
        <PureModal
        header="Plot"
        footer=""
        width="90%"
        isOpen={isGraphModalOpen2}
        closeButton="X"
        closeButtonPosition="header"
        onClose={() => {
            setImageSrc("");
            setGraphModalOpen2(false);
            return true;
        }}
    >
    <div style = {{overflow:"auto", whiteSpace: "nowrap"}}>
        {imageSrc ? <img src={imageSrc} /> : <p>Loading image...</p>}
    </div>
    </PureModal>
    </div>
}