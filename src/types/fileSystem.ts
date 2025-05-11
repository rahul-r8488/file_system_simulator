
export type FileType = 'folder' | 'file';
export type AllocationMethod = 'contiguous' | 'linked' | 'indexed';

export interface FileSystemNode {
  id: string;
  name: string;
  type: FileType;
  parentId: string | null;
  children?: string[]; // References to children IDs for folders
  content?: string; // Content for files
  allocationMethod: AllocationMethod;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  blocks?: number[]; // Block IDs used for storage simulation
  indexBlock?: number; // For indexed allocation
  nextBlock?: number; // For linked allocation
}

export interface FileSystemState {
  nodes: Record<string, FileSystemNode>;
  root: string; // Root folder ID
  currentFolder: string; // Current folder being viewed
  selectedNode: string | null;
  clipboard: {
    nodes: string[];
    operation: 'copy' | 'cut' | null;
  };
  diskSize: number; // Total disk size in "blocks"
  blockSize: number; // Size of each block in bytes
  usedBlocks: number[]; // Array of used block IDs
  openFiles: Record<string, boolean>; // Files that are currently open
  activeFile: string | null; // Currently active file
}

export interface FileOperation {
  type: 'create' | 'delete' | 'rename' | 'move' | 'copy' | 'update';
  nodeId?: string;
  parentId?: string;
  name?: string;
  content?: string;
  allocationMethod?: AllocationMethod;
}
