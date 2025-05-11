
import React from 'react';
import { useFileSystem } from '@/context/FileSystemContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TextEditor from './TextEditor';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Editor: React.FC = () => {
  const { state, closeFile, setActiveFile } = useFileSystem();
  
  const openFileIds = Object.keys(state.openFiles).filter(id => state.openFiles[id]);
  
  if (openFileIds.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium mb-2">No files open</h3>
          <p className="text-sm text-gray-500 mb-4">
            Select a file from the explorer to open it, or create a new file.
          </p>
          <p className="text-sm text-gray-400 mt-4">
            You can drag and drop files from your computer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Tabs 
        value={state.activeFile || openFileIds[0]} 
        onValueChange={setActiveFile}
        className="h-full flex flex-col"
      >
        <div className="border-b bg-gray-50">
          <TabsList className="h-9">
            {openFileIds.map(id => {
              const file = state.nodes[id];
              if (!file) return null;
              
              return (
                <div className="relative group" key={id}>
                  <TabsTrigger 
                    value={id}
                    className="data-[state=active]:bg-white rounded-none h-9 px-4 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
                  >
                    {file.name}
                  </TabsTrigger>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeFile(id);
                    }}
                  >
                    <X size={12} />
                  </Button>
                </div>
              );
            })}
          </TabsList>
        </div>
        
        <div className="flex-grow overflow-hidden">
          {openFileIds.map(id => (
            <TabsContent 
              key={id} 
              value={id} 
              className="h-full m-0 data-[state=active]:flex-grow"
            >
              <TextEditor fileId={id} />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};
