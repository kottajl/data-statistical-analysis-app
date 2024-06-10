import * as React from "react";
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import { Variable, VariableType } from "../classes/Variable"
import { showWarning } from "../components/Notifications"
import { useState } from 'react';


interface TopMenuProps {
  setCsvOutput: React.Dispatch<React.SetStateAction<string>>;
  setFileImportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFileExportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setHelpModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function TopMenu({setCsvOutput, setFileImportModalOpen, setFileExportModalOpen, setHelpModalOpen}: TopMenuProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null); 

    const handleImportClick = () => {
      fileInputRef.current?.click();
    };
  
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
  
      const file = event.target.files?.[0];
      if (!file) 
      {
        showWarning("No file selected.");
        return;
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'csv') 
      {
        showWarning("Invalid file type. Please select a CSV file.");
        return;
      }

      const fileReader = new FileReader();
  fileReader.onload = function (event: ProgressEvent<FileReader>) {
    if (!event.target || typeof event.target.result !== 'string') {
      showWarning("Failed to read file.");
      return;
    }

    const csvContent = event.target.result as string;

    try {
      setCsvOutput(csvContent);
      setFileImportModalOpen(true);
    } catch (error) {
      showWarning("An error occurred while processing the file.");
    }
  };

  fileReader.onerror = function () {
    showWarning("An error occurred while reading the file.");
  };

  fileReader.readAsText(file);
  };

  

  const onInputClick = (event: any) => {
    event.target.value = ''
  }

  return <div  style={{width : "100%", padding: 0, marginBottom: "0.7vh", height : "7vh", background: 'none', border: 'none', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
    <Menu 
    menuStyle={{marginTop : 7, width : 207}}
    menuButton={<MenuButton className="bu-button bu-is-light bu-is-normal" style={{width : 100 , marginRight : 7}}>File</MenuButton>} 
      >
        <MenuItem onClick={handleImportClick} style={{paddingLeft : 35}}>Import CSV</MenuItem>
        <MenuItem onClick={e => {setFileExportModalOpen(true)}} style={{paddingLeft : 35}}>Export CSV</MenuItem>
    </Menu>
    <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{display: 'none'}}
        onChange={handleFileChange}
        onClick={onInputClick}
    />
    <button
        className="bu-button bu-is-light bu-is-normal"
        onClick={() => setHelpModalOpen(true)}
        style={{ width: 100 }}
      >
        Help
      </button>

    </div>
}