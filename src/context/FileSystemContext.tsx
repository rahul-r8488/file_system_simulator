
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { FileSystemState, FileOperation, AllocationMethod } from '../types/fileSystem';
import { initializeFileSystem, processFileOperation } from '../utils/fileSystemUtils';
import { toast } from '@/components/ui/use-toast';

interface FileSystemContextProps {
  state: FileSystemState;
  createFile: (name: string, content?: string, allocationMethod?: AllocationMethod) => void;
  createFolder: (name: string) => void;
  deleteNode: (nodeId: string) => void;
  renameNode: (nodeId: string, newName: string) => void;
  updateFileContent: (nodeId: string, content: string, allocationMethod?: AllocationMethod) => void;
  navigateToFolder: (folderId: string) => void;
  selectNode: (nodeId: string | null) => void;
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string | null) => void;
}

type FileSystemAction = 
  | { type: 'PROCESS_OPERATION', operation: FileOperation }
  | { type: 'NAVIGATE_TO_FOLDER', folderId: string }
  | { type: 'SELECT_NODE', nodeId: string | null }
  | { type: 'OPEN_FILE', fileId: string }
  | { type: 'CLOSE_FILE', fileId: string }
  | { type: 'SET_ACTIVE_FILE', fileId: string | null };

const FileSystemContext = createContext<FileSystemContextProps | undefined>(undefined);

const fileSystemReducer = (state: FileSystemState, action: FileSystemAction): FileSystemState => {
  switch (action.type) {
    case 'PROCESS_OPERATION':
      return processFileOperation(state, action.operation);
    
    case 'NAVIGATE_TO_FOLDER':
      return {
        ...state,
        currentFolder: action.folderId,
      };
    
    case 'SELECT_NODE':
      return {
        ...state,
        selectedNode: action.nodeId,
      };
    
    case 'OPEN_FILE':
      return {
        ...state,
        openFiles: {
          ...state.openFiles,
          [action.fileId]: true,
        },
        activeFile: action.fileId,
      };
    
    case 'CLOSE_FILE':
      const { [action.fileId]: _, ...remainingOpenFiles } = state.openFiles;
      return {
        ...state,
        openFiles: remainingOpenFiles,
        activeFile: state.activeFile === action.fileId ? null : state.activeFile,
      };
    
    case 'SET_ACTIVE_FILE':
      return {
        ...state,
        activeFile: action.fileId,
      };
    
    default:
      return state;
  }
};

export const FileSystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(fileSystemReducer, null, () => {
    // Try to load from localStorage
    const savedState = localStorage.getItem('fileSystemState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Convert string dates back to Date objects
        Object.values(parsedState.nodes).forEach((node: any) => {
          node.createdAt = new Date(node.createdAt);
          node.modifiedAt = new Date(node.modifiedAt);
        });
        return parsedState;
      } catch (e) {
        console.error('Failed to load file system state from localStorage', e);
      }
    }
    return initializeFileSystem();
  });

  // Save to localStorage whenever state changes
  React.useEffect(() => {
    localStorage.setItem('fileSystemState', JSON.stringify(state));
  }, [state]);

  const createFile = (name: string, content = '', allocationMethod = 'contiguous' as AllocationMethod) => {
    dispatch({
      type: 'PROCESS_OPERATION',
      operation: {
        type: 'create',
        parentId: state.currentFolder,
        name,
        nodeId: 'file',
        content,
        allocationMethod,
      },
    });
  };

  const createFolder = (name: string) => {
    dispatch({
      type: 'PROCESS_OPERATION',
      operation: {
        type: 'create',
        parentId: state.currentFolder,
        name,
        nodeId: 'folder',
      },
    });
  };

  const deleteNode = (nodeId: string) => {
    dispatch({
      type: 'PROCESS_OPERATION',
      operation: {
        type: 'delete',
        nodeId,
      },
    });
    toast({
      title: "Deleted",
      description: "Item has been deleted",
    });
  };

  const renameNode = (nodeId: string, newName: string) => {
    dispatch({
      type: 'PROCESS_OPERATION',
      operation: {
        type: 'rename',
        nodeId,
        name: newName,
      },
    });
  };

  const updateFileContent = (nodeId: string, content: string, allocationMethod?: AllocationMethod) => {
    dispatch({
      type: 'PROCESS_OPERATION',
      operation: {
        type: 'update',
        nodeId,
        content,
        allocationMethod,
      },
    });
    toast({
      title: "Saved",
      description: "File has been saved",
    });
  };

  const navigateToFolder = (folderId: string) => {
    dispatch({
      type: 'NAVIGATE_TO_FOLDER',
      folderId,
    });
  };

  const selectNode = (nodeId: string | null) => {
    dispatch({
      type: 'SELECT_NODE',
      nodeId,
    });
  };

  const openFile = (fileId: string) => {
    dispatch({
      type: 'OPEN_FILE',
      fileId,
    });
  };

  const closeFile = (fileId: string) => {
    dispatch({
      type: 'CLOSE_FILE',
      fileId,
    });
  };

  const setActiveFile = (fileId: string | null) => {
    dispatch({
      type: 'SET_ACTIVE_FILE',
      fileId,
    });
  };

  return (
    <FileSystemContext.Provider
      value={{
        state,
        createFile,
        createFolder,
        deleteNode,
        renameNode,
        updateFileContent,
        navigateToFolder,
        selectNode,
        openFile,
        closeFile,
        setActiveFile,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = (): FileSystemContextProps => {
  const context = useContext(FileSystemContext);
  if (context === undefined) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};
