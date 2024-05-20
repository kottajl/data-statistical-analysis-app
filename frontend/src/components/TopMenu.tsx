import * as React from "react";
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import { Variable, VariableType } from "../classes/Variable"

interface TopMenuProps {
  setCsvOutput: React.Dispatch<React.SetStateAction<string>>;
  setFileImportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFileExportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function TopMenu({setCsvOutput, setFileImportModalOpen, setFileExportModalOpen}: TopMenuProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
      fileInputRef.current?.click();
    };
  
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
  
      const fileReader = new FileReader();
      fileReader.onload = function (event: ProgressEvent<FileReader>) {
        if (!event.target)
          return;
        setCsvOutput(event.target?.result as string);
        setFileImportModalOpen(true);
    };
    const file = event.target.files?.[0];
    if (file) 
      fileReader.readAsText(file);
  };

  const onInputClick = (event: any) => {
    event.target.value = ''
  }

  return <div className="box" style={{padding: 3, marginBottom: 5}}>
    <Menu menuButton={<MenuButton className="button is-light is-normal">File</MenuButton>} menuClassName="fileMenu">
        <MenuItem onClick={handleImportClick}>Import</MenuItem>
        <MenuItem onClick={e => {setFileExportModalOpen(true)}}>Export</MenuItem>
    </Menu>
    <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{display: 'none'}}
        onChange={handleFileChange}
        onClick={onInputClick}
    />
    </div>
}