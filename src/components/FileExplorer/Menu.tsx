
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileSystemNode } from '@/types/fileSystem';
import { useFileSystem } from '@/context/FileSystemContext';
import { 
  MoreVertical,
  Trash,
  Edit,
  FileText
} from 'lucide-react';
import { isTextFile } from '@/utils/fileSystemUtils';

interface MenuProps {
  node: FileSystemNode;
  onRename: (e?: React.MouseEvent) => void;
}

export const Menu: React.FC<MenuProps> = ({ node, onRename }) => {
  const { deleteNode, openFile } = useFileSystem();
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'file' && isTextFile(node.name)) {
      openFile(node.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(node.id);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRename(e);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={handleClick}>
        <button className="p-1 rounded-full hover:bg-gray-100">
          <MoreVertical size={14} className="text-gray-600" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {node.type === 'file' && isTextFile(node.name) && (
          <DropdownMenuItem onClick={handleOpen} className="cursor-pointer">
            <FileText size={14} className="mr-2" />
            Open
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleRename} className="cursor-pointer">
          <Edit size={14} className="mr-2" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-500">
          <Trash size={14} className="mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
