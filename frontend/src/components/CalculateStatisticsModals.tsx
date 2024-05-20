import * as React from "react";
import { ReactGrid, Column, Row, CellChange, TextCell, DefaultCellTypes, Id, MenuOption, CellLocation, SelectionMode } from "@silevis/reactgrid";
import { serverAddress } from "../App"
import PureModal from 'react-pure-modal';
import 'react-pure-modal/dist/react-pure-modal.min.css';
import { getColNameFromVarName, Variable, VariableType } from "../classes/Variable"

interface CalculateStatisticsModalsProps {
    variables: Variable[];
    selectedColIds: Id[];
    isStatModalOpen: boolean;
    setStatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CalculateStatisticsModals({variables, selectedColIds, isStatModalOpen, setStatModalOpen} : CalculateStatisticsModalsProps) {
  var [isResultModalOpen, setResultModalOpen] = React.useState<boolean>(false);
  var [columns2, setColumns2] = React.useState<Column[]>([]);
  var [rows2, setRows2] = React.useState<Row[]>([]);
  const [selMean, setSelMean] = React.useState(true);
  const [selMedian, setSelMedian] = React.useState(true);
  const [selMode, setSelMode] = React.useState(true);
  const [selStd, setSelStd] = React.useState(true);
  const [selMin, setSelMin] = React.useState(true);
  const [selMax, setSelMax] = React.useState(true);
  const [selUnique, setSelUnique] = React.useState(true);
  const [selIqr, setSelIqr] = React.useState(true);
  const [selSkew, setSelSkew] = React.useState(true);
  const [selKurtosis, setSelKurtosis] = React.useState(true);
  const [selPercentile, setSelPercentile] = React.useState(true);
  const [selMissing, setSelMissing] = React.useState(true);

  return <div><PureModal
  header="Calculate statistics"
  footer=""
  isOpen={isStatModalOpen}
  closeButton="X"
  closeButtonPosition="header"
  onClose={() => {
    setStatModalOpen(false);
    return true;
  }}
>
<form style={{display: 'flex', flexDirection: 'column'}}>
      <label style={{margin: 5}}><input type="checkbox" checked={selMean} onChange={() => setSelMean(!selMean)}/> Mean</label>
      <label style={{margin: 5}}><input type="checkbox" checked={selMedian} onChange={() => setSelMedian(!selMedian)}/> Median</label>
      <label style={{margin: 5}}><input type="checkbox" checked={selMode} onChange={() => setSelMode(!selMode)}/> Mode</label>
      <label style={{margin: 5}}><input type="checkbox" checked={selStd} onChange={() => setSelStd(!selStd)}/> Std</label>
      <label style={{margin: 5}}><input type="checkbox" checked={selMin} onChange={() => setSelMin(!selMin)}/> Min</label>
      <label style={{margin: 5}}><input type="checkbox" checked={selMax} onChange={() => setSelMax(!selMax)}/> Max</label>
      <label style={{margin: 5}}><input type="checkbox" checked={selUnique} onChange={() => setSelUnique(!selUnique)}/> Unique</label>
      <label style={{margin: 5}}><input type="checkbox" checked={selIqr} onChange={() => setSelIqr(!selIqr)}/> Iqr</label>
      <label style={{margin: 5}}><input type="checkbox" checked={selSkew} onChange={() => setSelSkew(!selSkew)}/> Skew</label>
      <label style={{margin: 5}}><input type="checkbox" checked={selKurtosis} onChange={() => setSelKurtosis(!selKurtosis)}/> Kurtosis</label>
      <label style={{margin: 5}}><input type="checkbox" checked={selPercentile} onChange={() => setSelPercentile(!selPercentile)}/> Percentile</label>
      <label style={{margin: 5}}><input type="checkbox" checked={selMissing} onChange={() => setSelMissing(!selMissing)}/> Missing</label>
      <input style={{margin: 5}} type="button" value="Calculate" onClick={(e) => {
        const _variables = variables.filter((v) => selectedColIds.includes(getColNameFromVarName(v.name)))
        const results: any[] = new Array(_variables.length);
        const promises: any[] = new Array(_variables.length);
        var f: string[] = []
        if (selMean)
          f.push("mean")
        if (selMedian)
          f.push("median")
        if (selMode)
          f.push("mode")
        if (selStd)
          f.push("std")
        if (selMin)
          f.push("min")
        if (selMax)
          f.push("max")
        if (selUnique)
          f.push("unique")
        if (selIqr)
          f.push("iqr")
        if (selSkew)
          f.push("skew")
        if (selKurtosis)
          f.push("kurtosis")
        if (selPercentile)
          f.push("precentile")
        if (selMissing)
          f.push("missing")
        var numData: number = f.length;
        _variables.forEach((v, idx) =>
          {
            const data = new URLSearchParams();
            f.forEach(_f => data.append("functions[]", _f));
            v.values.forEach(v2 => data.append('data[]', String(v2 === undefined ? null : v2)))
            if (v.type === VariableType.CATEGORICAL)
                data.append("type", "categorical");
            else
                data.append("type", "numerical");
            const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: data.toString()
            };

            promises[idx] = fetch(serverAddress+"/api/1d_stats/", requestOptions)
            .then(response => response.json())
            .then(response => results[idx] = {var: v, data: response})
          });
          Promise.all(promises).then(r => {
          if (f.includes("precentile"))
          {
            f = f.filter(_f => _f !== "precentile");
            f.push("quartile25");
            f.push("quartile50");
            f.push("quartile75");
            numData += 2;
          }
          if (f.includes("unique"))
            results.filter(r => r.var.type === VariableType.NUMERICAL).forEach(r => r.data["unique"] = r.data["unique"].length)
          setColumns2([
            {
              columnId: "Statistic",
              width:100,
              resizable: false,
              reorderable: false
            },
            ...results.map<Column>((result, idx) => ({
              columnId: getColNameFromVarName((result as any).var.name),
              width: (getColNameFromVarName((result as any).var.name).length + 4) * 10, 
              resizable: false,
              reorderable: false
            })),
          ]);
          setRows2([
            {
              rowId: "header",
              cells: [
                { type: "header", text: "Statistic"},
                ...results.map<DefaultCellTypes>((result, idx) => ({
                  type: "header",
                  text: (result as any).var.name + " (" + (result as any).var.type + ")"})
                ),
              ]
            },
            ...Array.from(Array(numData).keys()).map<Row>((idx) => ({
              rowId: idx,
              cells: [
                { type: "header", text: f[idx]},
                ...results.map<DefaultCellTypes>((result) => ({
                  type: "header",
                  text: isNaN(+(result as any).data[f[idx]]) ? "-" : String(Math.round((result as any).data[f[idx]] * 100) / 100)}
                )
                )
              ]
            }))
          ]);
          setStatModalOpen(false);
          setResultModalOpen(true);
        }
        )
      }}/>
  </form>
</PureModal>

<PureModal
  header="Results"
  footer=""
  width = "90%"
  isOpen={isResultModalOpen}
  closeButton="X"
  closeButtonPosition="header"
  onClose={() => {
    setResultModalOpen(false);
    return true;
  }}>
  <div style = {{overflow:"auto", whiteSpace: "nowrap"}}>
<ReactGrid
  rows={rows2} 
  columns={columns2}
/>
</div>
</PureModal></div>
}