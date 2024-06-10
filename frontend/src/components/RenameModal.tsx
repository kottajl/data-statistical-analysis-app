import * as React from "react";
import PureModal from 'react-pure-modal';
import { showWarning } from "./Notifications";
import { Variable, VariableType } from "../classes/Variable"

interface RenameModalProps {
    isRenameModalOpen: boolean;
    setRenameModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    variables: Variable[];
    variableId: number;
    updateSpreadsheet: (_variables: Variable[]) => void; 
}

export function RenameModal({isRenameModalOpen, setRenameModalOpen, variables, variableId, updateSpreadsheet} : RenameModalProps) {
    const [selectedName, setSelectedName] = React.useState("");
    return  <PureModal
            header="Rename variable"
            footer=""
            isOpen={isRenameModalOpen}
            closeButton="✕"
            closeButtonPosition="header"
            onClose={() => {
                setRenameModalOpen(false);
                return true;
            }}
        >
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                New name:  <input value = {selectedName} onChange={e => setSelectedName(e.target.value)} />
                <input style={{marginTop: 17, marginBottom : 7}} type="button" className="bu-button bu-is-light bu-is-normal" value="Rename" onClick={(e) => {
                    variables[variableId].name = selectedName;
                    updateSpreadsheet(variables);
                    setRenameModalOpen(false);
            }}></input>
            </div>
        </PureModal>
}