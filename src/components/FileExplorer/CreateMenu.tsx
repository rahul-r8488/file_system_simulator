
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  FolderPlus,
  FilePlus,
  Plus,
} from 'lucide-react';
import { useFileSystem } from '@/context/FileSystemContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AllocationMethod } from '@/types/fileSystem';

export const CreateMenu: React.FC = () => {
  const { createFile, createFolder } = useFileSystem();
  
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [isCreateFileDialogOpen, setIsCreateFileDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [allocationMethod, setAllocationMethod] = useState<AllocationMethod>('contiguous');
  
  const handleCreateFolder = () => {
    if (folderName.trim()) {
      createFolder(folderName.trim());
      setFolderName('');
      setIsCreateFolderDialogOpen(false);
    }
  };

  const handleCreateFile = () => {
    if (fileName.trim()) {
      createFile(fileName.trim(), fileContent, allocationMethod);
      setFileName('');
      setFileContent('');
      setIsCreateFileDialogOpen(false);
    }
  };

  // Fixed the issue by removing DialogTrigger that isn't wrapped in Dialog
  const openCreateFolderDialog = () => setIsCreateFolderDialogOpen(true);
  const openCreateFileDialog = () => setIsCreateFileDialogOpen(true);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-8 h-8 p-0">
            <Plus size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer" onClick={openCreateFolderDialog}>
            <FolderPlus size={16} className="mr-2" />
            New Folder
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={openCreateFileDialog}>
            <FilePlus size={16} className="mr-2" />
            New File
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateFolderDialogOpen} onOpenChange={setIsCreateFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateFileDialogOpen} onOpenChange={setIsCreateFileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-name">File Name</Label>
              <Input
                id="file-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name (e.g. example.txt)"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-content">Content</Label>
              <Textarea
                id="file-content"
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder="Enter file content"
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label>Allocation Method</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {allocationMethod === 'contiguous' && 'Contiguous Allocation'}
                    {allocationMethod === 'linked' && 'Linked Allocation'}
                    {allocationMethod === 'indexed' && 'Indexed Allocation'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFileDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
