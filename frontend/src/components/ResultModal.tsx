import * as React from "react";
import PureModal from 'react-pure-modal';

interface ResultModalProps {
    isResultModalOpen: boolean;
    setResultModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    result: any[];
    resultDescription: string;
}

export function ResultModal({isResultModalOpen, setResultModalOpen, result, resultDescription} : ResultModalProps) {
    return  <PureModal
            header="Result"
            footer=""
            isOpen={isResultModalOpen}
            closeButton="X"
            closeButtonPosition="header"
            onClose={() => {
                setResultModalOpen(false);
                return true;
            }}
            width="500px"
        >
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                <div>{resultDescription}</div>
                {result.map === undefined? "" : result.map(r => <div style={{fontWeight: "bold"}}>{String(r)}</div>)}
            </div>
        </PureModal>
}