import * as React from "react";
import { Spreadsheet, getColumns, getRows } from "./components/Spreadsheet"
import { CalculateStatisticsModals } from "./components/CalculateStatisticsModals"
import { Column, Row } from "@silevis/reactgrid";
import { TopMenu } from "./components/TopMenu"
import { Notifications } from "./components/Notifications"
import { Variable } from "./classes/Variable"
import { Id } from "@silevis/reactgrid";
import { FileImportModal } from "./components/FileImportModal";
import { FileExportModal } from "./components/FileExportModal";
import { RenameModal } from "./components/RenameModal";
import { GraphModal } from "./components/GraphModal";
import { MissingValuesModal } from "./components/MissingValuesModal";
//import 'bulma/css/bulma.min.css';

export const serverAddress = "http://127.0.0.1:8000";

function App() {  
  var [variables, setVariables] = React.useState<Variable[]>([]);
  var [variableValuesLength, setvariableValuesLength] = React.useState<number>(0);
  var [timestamps, setTimestamps] = React.useState<string[]>([]);
  var [caseIds, setCaseIds] = React.useState<string[]>([]);
  var [selectedColIds, setSelectedColIds] = React.useState<Id[]>([]);
  var [columns, setColumns] = React.useState<Column[]>([]);
  var [rows, setRows] = React.useState<Row[]>([]);
  var [isStatModalOpen, setStatModalOpen] = React.useState<boolean>(false);
  var [isFileImportModalOpen, setFileImportModalOpen] = React.useState<boolean>(false);
  var [isFileExportModalOpen, setFileExportModalOpen] = React.useState<boolean>(false);
  var [isRenameModalOpen, setRenameModalOpen] = React.useState<boolean>(false);
  var [csvOutput, setCsvOutput] = React.useState<string>("");
  var [variableToRenameId, setVariableToRenameId] = React.useState<number>(-1);
  var [isMissingValuesModalOpen, setMissingValuesModalOpen] = React.useState<boolean>(false);
  var [missingVariableIds, setMissingVariableIds] = React.useState<number[]>([]);
  var [isGraphModalOpen, setGraphModalOpen] = React.useState<boolean>(false);
  var [graphVariableIds, setGraphVariableIds] = React.useState<number[]>([]);

  const updateSpreadsheet = (_variables: Variable[], _variableValuesLength: number=variableValuesLength, _timestamps: string[]=timestamps, _caseIds: string[]=caseIds) =>
  {
      setVariables(_variables);
      setvariableValuesLength(_variableValuesLength);
      setTimestamps(_timestamps);
      setCaseIds(_caseIds);
      setColumns(getColumns(_variables));
      setRows(getRows(_variables, _variableValuesLength, _timestamps, _caseIds));
  }

  return <div style={{paddingRight: 10, paddingLeft: 10, paddingTop:5}}>
    <TopMenu setCsvOutput={setCsvOutput}
              setFileImportModalOpen = {setFileImportModalOpen}
              setFileExportModalOpen = {setFileExportModalOpen}/>
    <Spreadsheet variables={variables}
                setVariables={setVariables}
                variableValuesLength={variableValuesLength}
                setvariableValuesLength={setvariableValuesLength}
                timestamps={timestamps}
                setTimestamps={setTimestamps}
                caseIds={caseIds}
                setCaseIds={setCaseIds}
                selectedColIds={selectedColIds}
                setSelectedColIds={setSelectedColIds}
                columns={columns}
                setColumns={setColumns}
                rows={rows}
                setRows={setRows}
                updateSpreadsheet={updateSpreadsheet}
                setStatModalOpen={setStatModalOpen}
                setRenameModalOpen={setRenameModalOpen}
                setVariableToRenameId={setVariableToRenameId}
                serverAddress={serverAddress}
                setMissingValuesModalOpen={setMissingValuesModalOpen}
                setMissingVariableIds={setMissingVariableIds}
                setGraphModalOpen = {setGraphModalOpen}
                setGraphVariableIds = {setGraphVariableIds}
                />
    <CalculateStatisticsModals variables={variables} 
                              selectedColIds={selectedColIds}
                              isStatModalOpen={isStatModalOpen}
                              setStatModalOpen={setStatModalOpen}/>
    <FileImportModal isFileImportModalOpen={isFileImportModalOpen} 
                      setFileImportModalOpen={setFileImportModalOpen}
                      csvOutput={csvOutput}
                      updateSpreadsheet={updateSpreadsheet}/>
    <FileExportModal isFileExportModalOpen={isFileExportModalOpen} 
                      setFileExportModalOpen={setFileExportModalOpen}
                      variables={variables}
                      timestamps={timestamps}
                      caseIds={caseIds}/>
    <RenameModal isRenameModalOpen={isRenameModalOpen}
                  setRenameModalOpen={setRenameModalOpen}
                  variables={variables}
                  variableId={variableToRenameId}
                  updateSpreadsheet={updateSpreadsheet}/>
    <MissingValuesModal isMissingValuesModalOpen={isMissingValuesModalOpen}
                        setMissingValuesModalOpen={setMissingValuesModalOpen}
                        variables={variables}
                        variableIds={missingVariableIds}
                        updateSpreadsheet={updateSpreadsheet}
                        serverAddress={serverAddress}
    />
    <GraphModal isGraphModalOpen = {isGraphModalOpen}
                setGraphModalOpen = {setGraphModalOpen}
                serverAddress = {serverAddress}
                variableIds={graphVariableIds}
                variables={variables}
    />
    <Notifications/>
  </div>
  }; 
export default App;