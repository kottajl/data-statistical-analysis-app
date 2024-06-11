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
          width="fit-content"
        >
          <img src="help.png" alt="help" style={{ width: '800', height: 'auto', WebkitUserSelect: 'none', msUserSelect: 'none', userSelect: 'none'}} />
    
        </PureModal>
    </div>
}