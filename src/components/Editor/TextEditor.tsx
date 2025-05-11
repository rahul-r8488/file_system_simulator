
import React, { useState, useEffect } from 'react';
import { useFileSystem } from '@/context/FileSystemContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { AllocationMethod, FileSystemNode } from '@/types/fileSystem';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { getFileExtension } from '@/utils/fileSystemUtils';

interface TextEditorProps {
  fileId: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ fileId }) => {
  const { state, updateFileContent } = useFileSystem();
  const file = state.nodes[fileId] as FileSystemNode;
  
  const [content, setContent] = useState('');
  const [allocationMethod, setAllocationMethod] = useState<AllocationMethod>(file?.allocationMethod || 'contiguous');
  
  useEffect(() => {
    if (file?.content !== undefined) {
      setContent(file.content);
      setAllocationMethod(file.allocationMethod);
    }
  }, [file]);

  const handleSave = () => {
    updateFileContent(fileId, content, allocationMethod);
  };

  if (!file) {
    return <div className="p-4">File not found</div>;
  }

  const extension = getFileExtension(file.name);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">{file.name}</span>
          <span className="text-xs text-gray-500">
            {extension ? `.${extension}` : ''}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {allocationMethod === 'contiguous' && 'Contiguous'}
                {allocationMethod === 'linked' && 'Linked'}
                {allocationMethod === 'indexed' && 'Indexed'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Allocation Method</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={allocationMethod}
                onValueChange={(value) => setAllocationMethod(value as AllocationMethod)}
              >
                <DropdownMenuRadioItem value="contiguous">
                  Contiguous Allocation
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="linked">
                  Linked Allocation
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="indexed">
                  Indexed Allocation
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button size="sm" onClick={handleSave}>
            <Save size={16} className="mr-1" /> Save
          </Button>
        </div>
      </div>
      
      <div className="flex-grow p-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full resize-none font-mono text-sm bg-white"
        />
      </div>
      
      <div className="px-4 py-2 text-xs text-gray-500 border-t bg-gray-50">
        <div className="flex justify-between items-center">
          <span>Allocation: {allocationMethod}</span>
          <span>Size: {new Blob([content]).size} bytes</span>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
