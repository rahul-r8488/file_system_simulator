
import React from 'react';
import { CreateMenu } from './CreateMenu';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useFileSystem } from '@/context/FileSystemContext';
import { getBreadcrumbPath } from '@/utils/fileSystemUtils';
import Breadcrumb from './Breadcrumb';

interface ExplorerToolbarProps {
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const ExplorerToolbar: React.FC<ExplorerToolbarProps> = ({ onDrop }) => {
  const { state, navigateToFolder } = useFileSystem();
  
  const currentPath = getBreadcrumbPath(state, state.currentFolder);
  const canGoUp = currentPath.length > 1;
  
  const handleGoUp = () => {
    if (canGoUp) {
      const parentId = state.nodes[state.currentFolder]?.parentId;
      if (parentId) {
        navigateToFolder(parentId);
      }
    }
  };

  return (
    <div 
      className="flex items-center justify-between p-2 border-b bg-explorer-bg"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={handleGoUp}
          disabled={!canGoUp}
        >
          <ArrowLeft size={16} />
        </Button>
      </div>
      
      <div className="flex-grow mx-2">
        <Breadcrumb />
      </div>
      
      <CreateMenu />
    </div>
  );
};
