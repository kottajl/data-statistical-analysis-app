import * as React from "react";
import PureModal from 'react-pure-modal';

interface HelpModalProps 
{
  isHelpModalOpen: boolean;
  setHelpModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function HelpModal({isHelpModalOpen, setHelpModalOpen} : HelpModalProps) 
{
    return <div>
        <PureModal
          header="Help"
          footer=""
          isOpen={isHelpModalOpen}
          closeButton="✕"
          closeButtonPosition="header"
          onClose={() => {
            setHelpModalOpen(false);
            return true;
          }}
        >
          <img src="help.png" alt="help" style={{ maxWidth: '100%', maxHeight: '100%' }} />
    
        </PureModal>
    </div>
}