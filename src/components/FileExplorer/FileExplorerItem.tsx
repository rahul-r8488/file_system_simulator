
import React, { useState } from 'react';
import { useFileSystem } from '@/context/FileSystemContext';
import { FileSystemNode } from '@/types/fileSystem';
import FileIcon from './FileIcon';
import { Menu } from '@/components/FileExplorer/Menu';
import { isTextFile } from '@/utils/fileSystemUtils';
import { cn } from '@/lib/utils';

interface FileExplorerItemProps {
  node: FileSystemNode;
  level?: number;
}

const FileExplorerItem: React.FC<FileExplorerItemProps> = ({
  node,
  level = 0,
}) => {
  const { state, navigateToFolder, selectNode, openFile } = useFileSystem();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);
  
  const isSelected = state.selectedNode === node.id;
  const isOpen = state.openFiles[node.id];
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
    
    if (node.type === 'folder') {
      navigateToFolder(node.id);
    } else if (node.type === 'file' && isTextFile(node.name)) {
      openFile(node.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (node.type === 'file' && isTextFile(node.name)) {
      openFile(node.id);
    }
  };

  const handleStartRenaming = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNewName(node.name);
    setIsRenaming(true);
  };

  return (
    <div 
      className={cn(
        'flex items-center group px-2 py-1 rounded-md cursor-pointer hover:bg-explorer-hover',
        isSelected && 'bg-explorer-selected',
        isOpen && 'font-medium'
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{ paddingLeft: `${(level * 12) + 8}px` }}
    >
      <div className="flex-shrink-0 mr-2">
        <FileIcon fileName={node.name} isFolder={node.type === 'folder'} />
      </div>
      
      {isRenaming ? (
        <input
          type="text"
          className="flex-grow bg-white border border-blue-400 rounded px-1 py-0 text-sm outline-none"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          onBlur={() => setIsRenaming(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setIsRenaming(false);
              if (newName.trim() && newName !== node.name) {
                // Handle rename via context
                const { renameNode } = useFileSystem();
                renameNode(node.id, newName);
              }
            } else if (e.key === 'Escape') {
              setIsRenaming(false);
            }
          }}
        />
      ) : (
        <span className="flex-grow truncate text-sm">{node.name}</span>
      )}
      
      {!isRenaming && (
        <div className="opacity-0 group-hover:opacity-100">
          <Menu node={node} onRename={handleStartRenaming} />
        </div>
      )}
    </div>
  );
};

export default FileExplorerItem;
