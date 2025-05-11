
import React from 'react';
import { useFileSystem } from '@/context/FileSystemContext';
import FileExplorerItem from './FileExplorerItem';
import { FileSystemNode } from '@/types/fileSystem';
import { ScrollArea } from '@/components/ui/scroll-area';

const FileList: React.FC = () => {
  const { state } = useFileSystem();
  const currentFolder = state.nodes[state.currentFolder];
  
  if (!currentFolder) {
    return <div>Folder not found</div>;
  }

  const childrenIds = currentFolder.children || [];

  const renderNode = (nodeId: string, level = 0): React.ReactNode => {
    const node = state.nodes[nodeId];
    if (!node) return null;

    return (
      <React.Fragment key={node.id}>
        <FileExplorerItem node={node} level={level} />
      </React.Fragment>
    );
  };

  // Sort folders first, then files alphabetically
  const sortedChildrenIds = [...childrenIds].sort((a, b) => {
    const nodeA = state.nodes[a];
    const nodeB = state.nodes[b];
    
    if (!nodeA || !nodeB) return 0;
    
    // Folders first
    if (nodeA.type !== nodeB.type) {
      return nodeA.type === 'folder' ? -1 : 1;
    }
    
    // Then alphabetically
    return nodeA.name.localeCompare(nodeB.name);
  });

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-2">
        {sortedChildrenIds.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            This folder is empty
          </div>
        ) : (
          sortedChildrenIds.map((id) => renderNode(id))
        )}
      </div>
    </ScrollArea>
  );
};

export default FileList;
