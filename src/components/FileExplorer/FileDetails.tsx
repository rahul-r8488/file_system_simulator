
import React from 'react';
import { useFileSystem } from '@/context/FileSystemContext';
import { FileSystemNode } from '@/types/fileSystem';
import { isTextFile } from '@/utils/fileSystemUtils';
import { Button } from '@/components/ui/button';
import FileIcon from './FileIcon';
import { AllocationVisualizer } from './AllocationVisualizer';

export const FileDetails: React.FC = () => {
  const { state, openFile } = useFileSystem();
  const { selectedNode } = state;
  
  if (!selectedNode) {
    return <div className="p-4 text-gray-500 text-sm">No item selected</div>;
  }
  
  const node = state.nodes[selectedNode];
  
  if (!node) {
    return <div className="p-4 text-red-500">Item not found</div>;
  }
  
  const isText = node.type === 'file' && isTextFile(node.name);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <div className="mr-3">
          <FileIcon fileName={node.name} isFolder={node.type === 'folder'} size={32} />
        </div>
        <div>
          <h3 className="text-lg font-medium">{node.name}</h3>
          <p className="text-sm text-gray-500">{node.type === 'folder' ? 'Folder' : 'File'}</p>
        </div>
      </div>
      
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-gray-500">Created</p>
          <p>{formatDate(node.createdAt)}</p>
        </div>
        
        <div>
          <p className="text-gray-500">Modified</p>
          <p>{formatDate(node.modifiedAt)}</p>
        </div>
        
        {node.type === 'file' && (
          <>
            <div>
              <p className="text-gray-500">Size</p>
              <p>{formatSize(node.size)}</p>
            </div>
            
            <div>
              <p className="text-gray-500">Allocation Method</p>
              <p className="capitalize">{node.allocationMethod}</p>
            </div>
            
            {node.blocks && (
              <div>
                <p className="text-gray-500">Blocks Used</p>
                <p>{node.blocks.length}</p>
              </div>
            )}
          </>
        )}
        
        {node.type === 'folder' && node.children && (
          <div>
            <p className="text-gray-500">Items</p>
            <p>{node.children.length}</p>
          </div>
        )}
      </div>
      
      {node.type === 'file' && (
        <div className="mt-6 space-x-2">
          {isText && (
            <Button size="sm" onClick={() => openFile(node.id)}>
              Open
            </Button>
          )}
          
          <AllocationVisualizer fileId={node.id} />
        </div>
      )}
    </div>
  );
};
