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

    const downloadPlot = () => {
        const link = document.createElement('a');
        if (link instanceof HTMLAnchorElement) {
        link.href = imageSrc;
        link.download = 'plot.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        }
      };
      
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
            <p>Plot type</p>
            <select value = {selectedType} onChange={e => setSelectedType(e.target.value)}>
                <option value="linear">Linear plot</option>
                <option value="scatter">Scatter plot</option>
                {<option value="boxplot">Box plot</option>}
                <option value="hist">Histogram</option>
                <option value="bar">Bar chart</option>
                <option value="pie_chart">Pie chart</option>
                <option value="heatmap">Heatmap</option>
            </select>
            <p><input style={{margin: 5}} type="button" className="bu-button bu-is-light bu-is-normal" value="Show" onClick={(e) => {
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
                   // console.log(i+1)
                    data.append('ID[]', String(i+1))
                }
            })
            //console.log(data.toString());
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: data.toString()
              };
              
              const fetchAndSetImage = async () => {
                try {
                  const response = await fetch(serverAddress + "/api/plots/1d/", requestOptions);
                  if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                  }
                  const blob = await response.blob();
                  setImageSrc(URL.createObjectURL(blob));
                  setGraphModalOpen(false);
                  setGraphModalOpen2(true);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
                  showWarning(`Error fetching the image: ${errorMessage}`);
                }
              };
              
              fetchAndSetImage();
        }}></input></p>
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
    <div style = {{overflow:"auto", whiteSpace: "nowrap", display: 'flex', flexDirection: 'column', justifyContent: 'flex-center'}}>
        {imageSrc ? <button className="bu-button bu-is-light bu-is-normal" onClick={downloadPlot} style = {{width: 150}}>Save plot</button>: ""}
        {imageSrc ? <img src={imageSrc} /> : <p>Loading image...</p>}
    </div>
    </PureModal>
    </div>
}