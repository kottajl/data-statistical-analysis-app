import * as React from "react";
import PureModal from 'react-pure-modal';
import { showWarning } from "./Notifications";
import { Variable, VariableType } from "../classes/Variable"

interface PlotModalProps {
    isPlotModalOpen: boolean;
    setPlotModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    serverAddress: string;
    variableIds: number[];
    variables: Variable[];
    mainPlotType: string;
}

export function PlotModal({isPlotModalOpen, setPlotModalOpen, serverAddress, variableIds, variables, mainPlotType} : PlotModalProps) {
    const [imageSrc, setImageSrc] = React.useState('');
    const [selectedType, setSelectedType] = React.useState('');
    const [selectedVariableId, setSelectedVariableId] = React.useState("");
    const [isPlotModalOpen2, setPlotModalOpen2] = React.useState<boolean>(false);
    const [plotType, setPlotType] = React.useState<string>("");

    React.useEffect(() => {
        if (mainPlotType === "1d")
        {
            if (variables[variableIds[0]].type === VariableType.NUMERICAL)
            {
                setSelectedType("1dn;scatter");
                setPlotType("1dn");       
            }
            else
            {
                setSelectedType("1dc;bar");
                setPlotType("1dc");     
            }
        }
        else if (mainPlotType === "2d")
        {
            setSelectedVariableId(variables[variableIds[0]].name);
            if (variableIds.length === 3)
            {
                setSelectedType("2dnnc;2Y_axis");
                setPlotType("2dnnc");
                if (variables[variableIds[0]].type === VariableType.CATEGORICAL)
                    setSelectedVariableId(variables[variableIds[0]].name);
                else if (variables[variableIds[1]].type === VariableType.CATEGORICAL)
                    setSelectedVariableId(variables[variableIds[1]].name);
                else
                    setSelectedVariableId(variables[variableIds[2]].name);

            }
            else if (variables[variableIds[0]].type === VariableType.NUMERICAL && variables[variableIds[1]].type === VariableType.NUMERICAL)
            {
                setSelectedType("2dnn;scatter");
                setPlotType("2dnn");
            }
            else if (variables[variableIds[0]].type === VariableType.CATEGORICAL && variables[variableIds[1]].type === VariableType.CATEGORICAL)
            {
                setSelectedType("2dcc;stacked_bar");
                setPlotType("2dcc");
            }
            else
            {
                setSelectedType("2dnc;scatter");
                setPlotType("2dnc");
            }
        }
    }, [mainPlotType, variables, variableIds]);

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

    const requiresVariableId = () => {
        return mainPlotType === "2d" && selectedType !== "2dcc;categorical_heatmap" && selectedType !== "2dnn;heatmap" && selectedType !== "2dnnc;2Y_axis"
    }
      
  return  <div><PureModal
            header="Plot"
            footer=""
            isOpen={isPlotModalOpen}
            closeButton="X"
            closeButtonPosition="header"
            onClose={() => {
                setPlotModalOpen(false);
                return true;
            }}
        >
        <div>
            <p>Plot type</p>
            <select value = {selectedType} onChange={e => setSelectedType(e.target.value)}>
                {/* 1d num */}
                <option style = {{display: plotType === "1dn" ? "block": "none"}} value="1dn;scatter">Scatter plot</option>
                <option style = {{display: plotType === "1dn" ? "block": "none"}} value="1dn;linear">Linear plot</option>
                <option style = {{display: plotType === "1dn" ? "block": "none"}} value="1dn;boxplot">Box plot</option>
                <option style = {{display: plotType === "1dn" ? "block": "none"}} value="1dn;hist">Histogram</option>

                {/* 1d cat */}
                <option style = {{display: plotType === "1dc" ? "block": "none"}} value="1dc;bar">Bar chart</option>
                <option style = {{display: plotType === "1dc" ? "block": "none"}} value="1dc;pie_chart">Pie chart</option>

                {/* 2d num + num */}
                <option style = {{display: plotType === "2dnn" ? "block": "none"}} value="2dnn;scatter">Scatter plot</option>
                <option style = {{display: plotType === "2dnn" ? "block": "none"}} value="2dnn;linear">Linear plot</option>
                <option style = {{display: plotType === "2dnn" ? "block": "none"}} value="2dnn;heatmap">Heatmap</option>

                {/* 2d num + cat */}
                <option style = {{display: plotType === "2dnc" ? "block": "none"}} value="2dnc;scatter">Scatter plot</option>
                <option style = {{display: plotType === "2dnc" ? "block": "none"}} value="2dnc;linear">Linear plot</option>
                <option style = {{display: plotType === "2dnc" ? "block": "none"}} value="2dnc;bar">Bar plot</option>
                <option style = {{display: plotType === "2dnc" ? "block": "none"}} value="2dnc;boxplot">Box plot</option>

                {/* 2d cat + cat */}
                <option style = {{display: plotType === "2dcc" ? "block": "none"}} value="2dcc;stacked_bar">Stacked bar plot</option>
                <option style = {{display: plotType === "2dcc" ? "block": "none"}} value="2dcc;mosaic">Mosaic plot</option>
                <option style = {{display: plotType === "2dcc" ? "block": "none"}} value="2dcc;categorical_heatmap">Heatmap</option>

                {/* 2d num + num + cat */}
                <option style = {{display: plotType === "2dnnc" ? "block": "none"}} value="2dnnc;2Y_axis">2Y axis plot</option>
            </select>
            <p style = {{display: requiresVariableId() ? "block": "none"}} >Variable on X axis</p>
            <select style = {{display: requiresVariableId() ? "block": "none"}} value = {selectedVariableId} onChange={e => setSelectedVariableId(e.target.value)}>
                <option value={variables[variableIds[0]]? variables[variableIds[0]].name: ""}>{variables[variableIds[0]]? variables[variableIds[0]].name: ""}</option>
                <option value={variables[variableIds[1]]? variables[variableIds[1]].name: ""}>{variables[variableIds[1]]? variables[variableIds[1]].name: ""}</option>
            </select>
            <p><input style={{margin: 5}} type="button" className="bu-button bu-is-light bu-is-normal" value="Show" onClick={(e) => {
            
            const data = new URLSearchParams();
            const idsToRemove: number[] = []
            variableIds.forEach(i => {
                variables[i].values.forEach((v, idx) => {if (v === undefined || v === "") idsToRemove.push(idx)})
            })
            variableIds.forEach(i => {
                //console.log(variables[i].values.toString().substring(0, variables[i].values.toString().length - 1));
                //variables[i].values.forEach(v => data.append('data[]', String(v)));
                var _values: any = []
                variables[i].values.forEach((v, i) => {if (!idsToRemove.includes(i)) _values.push(v)})
                data.append('data[]', _values.toString().substring(0, _values.toString().length - 1));
                //data.append('data[]', '0')
                data.append('data_types[]', variables[i].type === VariableType.NUMERICAL ? "numerical" : "categorical");
                data.append('variable_names[]', variables[i].name);
            })
            //if (requiresVariableId())
            data.append("ID_variable", selectedVariableId);
            data.append('plot_type', selectedType.split(";")[1]);
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
                const response = await fetch(serverAddress + "/api/plots/"+mainPlotType+"/", requestOptions);
                if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                }
                const blob = await response.blob();
                setImageSrc(URL.createObjectURL(blob));
                setPlotModalOpen(false);
                setPlotModalOpen2(true);
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
        isOpen={isPlotModalOpen2}
        closeButton="X"
        closeButtonPosition="header"
        onClose={() => {
            setImageSrc("");
            setPlotModalOpen2(false);
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