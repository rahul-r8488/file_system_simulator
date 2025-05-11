
import React from 'react';
import { ExplorerToolbar } from './ExplorerToolbar';
import FileList from './FileList';
import { useFileSystem } from '@/context/FileSystemContext';
import { toast } from '@/components/ui/use-toast';
import { getFileExtension, isTextFile } from '@/utils/fileSystemUtils';

export const Explorer: React.FC = () => {
  const { createFile } = useFileSystem();

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files?.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      
      for (const file of files) {
        try {
          if (isTextFile(file.name)) {
            const content = await file.text();
            createFile(file.name, content);
          } else {
            toast({
              title: "Unsupported File",
              description: "Only text files can be opened and edited",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Error reading file:", error);
          toast({
            title: "Error",
            description: `Failed to read file: ${file.name}`,
            variant: "destructive"
          });
        }
      }
    }
  };

  return (
    <div className="h-full flex flex-col border-r">
      <ExplorerToolbar onDrop={handleDrop} />
      <div className="flex-grow overflow-hidden bg-explorer-bg">
        <FileList />
      </div>
      <div className="p-2 text-xs text-gray-500 border-t bg-explorer-bg">
        <span className="block">Drag & drop files here</span>
      </div>
    </div>
  );
};
