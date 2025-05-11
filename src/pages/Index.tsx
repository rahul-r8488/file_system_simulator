
import React, { useState } from 'react';
import { FileSystemProvider } from '@/context/FileSystemContext';
import { Explorer } from '@/components/FileExplorer/Explorer';
import { Editor } from '@/components/Editor/Editor';
import { FileDetails } from '@/components/FileExplorer/FileDetails';
import { DiskUsageInfo } from '@/components/DiskUsageInfo';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [showDetails, setShowDetails] = useState(!isMobile);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <FileSystemProvider>
      <div className="h-screen w-screen overflow-hidden bg-white">
        {/* Mobile toolbar */}
        {isMobile && (
          <div className="flex items-center justify-between p-2 border-b">
            <Button variant="outline" size="sm" onClick={toggleSidebar}>
              {showSidebar ? 'Hide Explorer' : 'Show Explorer'}
            </Button>
            <h1 className="text-lg font-medium">Virtual File Forge</h1>
            <Button variant="outline" size="sm" onClick={toggleDetails}>
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        )}

        <div className="h-[calc(100%-48px)] flex">
          {/* File Explorer Sidebar */}
          {(showSidebar || !isMobile) && (
            <div className="w-64 flex-shrink-0 border-r h-full flex flex-col">
              <Explorer />
              <DiskUsageInfo />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-grow h-full flex">
            {/* Editor Area */}
            <div className="flex-grow h-full overflow-hidden">
              <Editor />
            </div>

            {/* Details Sidebar */}
            {(showDetails || !isMobile) && (
              <div className="w-60 border-l flex-shrink-0 h-full overflow-auto">
                <FileDetails />
              </div>
            )}
          </div>
        </div>
      </div>
    </FileSystemProvider>
  );
};

export default Index;
