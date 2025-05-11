
import { FileSystemNode, FileSystemState, AllocationMethod, FileOperation } from "../types/fileSystem";
import { toast } from "@/components/ui/use-toast";

// Generate a unique ID for nodes
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Calculate the size in blocks
export const calculateBlocksNeeded = (content: string, blockSize: number): number => {
  const contentSize = new Blob([content]).size;
  return Math.ceil(contentSize / blockSize) || 1; // Minimum 1 block
};

// Find available blocks for contiguous allocation
export const findContiguousBlocks = (
  state: FileSystemState,
  numBlocks: number
): number[] | null => {
  const { diskSize, usedBlocks } = state;
  const freeBlocks: number[] = [];

  // Create array of used blocks for quick lookup
  const usedBlocksSet = new Set(usedBlocks);

  // Find contiguous blocks
  let start = -1;
  let count = 0;

  for (let i = 0; i < diskSize; i++) {
    if (!usedBlocksSet.has(i)) {
      if (start === -1) start = i;
      count++;

      if (count === numBlocks) {
        // Found enough contiguous blocks
        for (let j = 0; j < numBlocks; j++) {
          freeBlocks.push(start + j);
        }
        return freeBlocks;
      }
    } else {
      // Reset counter when encountering a used block
      start = -1;
      count = 0;
    }
  }

  // Not enough contiguous blocks
  return null;
};

// Find available blocks for any allocation
export const findAvailableBlocks = (
  state: FileSystemState,
  numBlocks: number
): number[] | null => {
  const { diskSize, usedBlocks } = state;
  const freeBlocks: number[] = [];

  // Create array of used blocks for quick lookup
  const usedBlocksSet = new Set(usedBlocks);

  // Find any available blocks
  for (let i = 0; i < diskSize && freeBlocks.length < numBlocks; i++) {
    if (!usedBlocksSet.has(i)) {
      freeBlocks.push(i);
    }
  }

  return freeBlocks.length === numBlocks ? freeBlocks : null;
};

// Allocate blocks based on allocation method
export const allocateBlocks = (
  state: FileSystemState,
  content: string,
  method: AllocationMethod
): { blocks: number[], indexBlock?: number, nextBlock?: number } | null => {
  const blocksNeeded = calculateBlocksNeeded(content, state.blockSize);
  
  if (blocksNeeded > (state.diskSize - state.usedBlocks.length)) {
    toast({
      title: "Disk Full",
      description: `Not enough space to allocate ${blocksNeeded} blocks`,
      variant: "destructive"
    });
    return null;
  }

  let allocatedBlocks: number[] | null = null;
  let indexBlock: number | undefined;
  let nextBlock: number | undefined;

  switch (method) {
    case 'contiguous':
      allocatedBlocks = findContiguousBlocks(state, blocksNeeded);
      break;
    
    case 'linked':
      allocatedBlocks = findAvailableBlocks(state, blocksNeeded);
      if (allocatedBlocks) {
        // For linked allocation, we set up nextBlock references
        for (let i = 0; i < allocatedBlocks.length - 1; i++) {
          nextBlock = allocatedBlocks[0];
        }
      }
      break;

    case 'indexed':
      // For indexed allocation, we need one extra block for the index
      allocatedBlocks = findAvailableBlocks(state, blocksNeeded + 1);
      if (allocatedBlocks) {
        // The first block is the index block
        indexBlock = allocatedBlocks.shift() as number;
      }
      break;
  }

  if (!allocatedBlocks) {
    if (method === 'contiguous') {
      toast({
        title: "Allocation Failed",
        description: `Could not find ${blocksNeeded} contiguous blocks. Try a different allocation method.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Disk Full",
        description: "Not enough space to allocate blocks",
        variant: "destructive"
      });
    }
    return null;
  }

  return { blocks: allocatedBlocks, indexBlock, nextBlock };
};

// Create a new file or folder
export const createNode = (
  state: FileSystemState,
  parentId: string,
  name: string,
  type: 'file' | 'folder',
  content: string = '',
  allocationMethod: AllocationMethod = 'contiguous'
): FileSystemState => {
  // Check if name already exists in the parent folder
  const parentNode = state.nodes[parentId];
  if (!parentNode) {
    toast({
      title: "Error",
      description: "Parent folder not found",
      variant: "destructive"
    });
    return state;
  }

  const siblings = parentNode.children || [];
  const siblingNames = siblings.map(id => state.nodes[id]?.name || '');
  
  if (siblingNames.includes(name)) {
    toast({
      title: "Error",
      description: `A file or folder named "${name}" already exists`,
      variant: "destructive"
    });
    return state;
  }

  const id = generateId();
  const now = new Date();
  
  let newNode: FileSystemNode = {
    id,
    name,
    type,
    parentId,
    size: type === 'folder' ? 0 : new Blob([content]).size,
    createdAt: now,
    modifiedAt: now,
    allocationMethod: type === 'folder' ? 'contiguous' : allocationMethod,
  };

  if (type === 'folder') {
    newNode.children = [];
  } else {
    // Allocate blocks for file content
    const allocation = allocateBlocks(state, content, allocationMethod);
    if (!allocation) return state;

    newNode = {
      ...newNode,
      content,
      blocks: allocation.blocks,
      indexBlock: allocation.indexBlock,
      nextBlock: allocation.nextBlock,
    };
  }

  // Update state
  const updatedNodes = {
    ...state.nodes,
    [id]: newNode,
    [parentId]: {
      ...parentNode,
      children: [...(parentNode.children || []), id],
      modifiedAt: now,
    },
  };

  return {
    ...state,
    nodes: updatedNodes,
    usedBlocks: [
      ...state.usedBlocks,
      ...(newNode.blocks || []),
      ...(newNode.indexBlock !== undefined ? [newNode.indexBlock] : []),
    ],
  };
};

// Delete a node and its children recursively
export const deleteNode = (
  state: FileSystemState,
  nodeId: string
): FileSystemState => {
  const node = state.nodes[nodeId];
  if (!node) return state;

  let updatedNodes = { ...state.nodes };
  let blocksToFree: number[] = [];

  // Function to recursively delete nodes and collect blocks to free
  const deleteRecursive = (id: string) => {
    const currentNode = updatedNodes[id];
    if (!currentNode) return;

    // Add blocks to free
    if (currentNode.blocks) {
      blocksToFree.push(...currentNode.blocks);
    }
    
    if (currentNode.indexBlock !== undefined) {
      blocksToFree.push(currentNode.indexBlock);
    }

    // Recursively delete children if it's a folder
    if (currentNode.type === 'folder' && currentNode.children) {
      currentNode.children.forEach(childId => deleteRecursive(childId));
    }

    // Delete the node
    delete updatedNodes[id];
  };

  // Start recursive deletion
  deleteRecursive(nodeId);

  // Update parent's children list
  if (node.parentId && updatedNodes[node.parentId]) {
    const parentNode = updatedNodes[node.parentId];
    updatedNodes[node.parentId] = {
      ...parentNode,
      children: (parentNode.children || []).filter(id => id !== nodeId),
      modifiedAt: new Date(),
    };
  }

  // Update used blocks
  const updatedUsedBlocks = state.usedBlocks.filter(
    blockId => !blocksToFree.includes(blockId)
  );

  return {
    ...state,
    nodes: updatedNodes,
    usedBlocks: updatedUsedBlocks,
    selectedNode: state.selectedNode === nodeId ? null : state.selectedNode,
    activeFile: state.activeFile === nodeId ? null : state.activeFile,
    openFiles: {
      ...state.openFiles,
      [nodeId]: false,
    },
  };
};

// Rename a node
export const renameNode = (
  state: FileSystemState,
  nodeId: string,
  newName: string
): FileSystemState => {
  const node = state.nodes[nodeId];
  if (!node) return state;

  // Check if name already exists in the parent folder
  if (node.parentId) {
    const parentNode = state.nodes[node.parentId];
    if (parentNode && parentNode.children) {
      const siblings = parentNode.children.filter(id => id !== nodeId);
      const siblingNames = siblings.map(id => state.nodes[id]?.name || '');
      
      if (siblingNames.includes(newName)) {
        toast({
          title: "Error",
          description: `A file or folder named "${newName}" already exists`,
          variant: "destructive"
        });
        return state;
      }
    }
  }

  // Update the node
  return {
    ...state,
    nodes: {
      ...state.nodes,
      [nodeId]: {
        ...node,
        name: newName,
        modifiedAt: new Date(),
      },
    },
  };
};

// Update file content
export const updateFileContent = (
  state: FileSystemState,
  nodeId: string,
  newContent: string,
  allocationMethod?: AllocationMethod
): FileSystemState => {
  const node = state.nodes[nodeId];
  if (!node || node.type !== 'file') return state;

  // Free existing blocks
  const blocksToFree = [
    ...(node.blocks || []),
    ...(node.indexBlock !== undefined ? [node.indexBlock] : []),
  ];

  const updatedUsedBlocks = state.usedBlocks.filter(
    blockId => !blocksToFree.includes(blockId)
  );

  // Allocate new blocks
  const methodToUse = allocationMethod || node.allocationMethod;
  const updatedState = {
    ...state,
    usedBlocks: updatedUsedBlocks,
  };

  const allocation = allocateBlocks(updatedState, newContent, methodToUse);
  if (!allocation) return state; // Keep original if allocation fails

  // Update the node
  return {
    ...updatedState,
    nodes: {
      ...state.nodes,
      [nodeId]: {
        ...node,
        content: newContent,
        size: new Blob([newContent]).size,
        modifiedAt: new Date(),
        blocks: allocation.blocks,
        indexBlock: allocation.indexBlock,
        nextBlock: allocation.nextBlock,
        allocationMethod: methodToUse,
      },
    },
    usedBlocks: [
      ...updatedUsedBlocks,
      ...allocation.blocks,
      ...(allocation.indexBlock !== undefined ? [allocation.indexBlock] : []),
    ],
  };
};

// Get breadcrumb path for a node
export const getBreadcrumbPath = (
  state: FileSystemState,
  nodeId: string
): { id: string; name: string }[] => {
  const path: { id: string; name: string }[] = [];
  let currentId = nodeId;
  
  while (currentId) {
    const node = state.nodes[currentId];
    if (!node) break;
    
    path.unshift({ id: node.id, name: node.name });
    if (!node.parentId) break;
    currentId = node.parentId;
  }
  
  return path;
};

// Get file extension
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};

// Check if file is a text file that can be edited
export const isTextFile = (filename: string): boolean => {
  const textExtensions = ['txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'json', 'c', 'cpp', 'h', 'py', 'java', 'sh'];
  const ext = getFileExtension(filename);
  return textExtensions.includes(ext);
};

// Initialize file system
export const initializeFileSystem = (diskSize = 1000, blockSize = 1024): FileSystemState => {
  const rootId = generateId();
  const now = new Date();
  
  return {
    nodes: {
      [rootId]: {
        id: rootId,
        name: 'Root',
        type: 'folder',
        parentId: null,
        children: [],
        size: 0,
        createdAt: now,
        modifiedAt: now,
        allocationMethod: 'contiguous',
      },
    },
    root: rootId,
    currentFolder: rootId,
    selectedNode: null,
    clipboard: {
      nodes: [],
      operation: null,
    },
    diskSize,
    blockSize,
    usedBlocks: [],
    openFiles: {},
    activeFile: null,
  };
};

// Process file operation
export const processFileOperation = (
  state: FileSystemState,
  operation: FileOperation
): FileSystemState => {
  switch (operation.type) {
    case 'create':
      if (!operation.parentId || !operation.name) return state;
      return createNode(
        state,
        operation.parentId,
        operation.name,
        operation.nodeId === 'folder' ? 'folder' : 'file',
        operation.content || '',
        operation.allocationMethod
      );
    
    case 'delete':
      if (!operation.nodeId) return state;
      return deleteNode(state, operation.nodeId);
    
    case 'rename':
      if (!operation.nodeId || !operation.name) return state;
      return renameNode(state, operation.nodeId, operation.name);
    
    case 'update':
      if (!operation.nodeId || operation.content === undefined) return state;
      return updateFileContent(
        state, 
        operation.nodeId, 
        operation.content,
        operation.allocationMethod
      );
    
    default:
      return state;
  }
};
