
import React from 'react';
import { useFileSystem } from '@/context/FileSystemContext';
import { getBreadcrumbPath } from '@/utils/fileSystemUtils';
import { Folder } from 'lucide-react';

const Breadcrumb: React.FC = () => {
  const { state, navigateToFolder } = useFileSystem();
  
  const path = getBreadcrumbPath(state, state.currentFolder);
  
  return (
    <div className="flex items-center px-4 py-2 overflow-x-auto text-sm bg-explorer-bg">
      {path.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && (
            <span className="mx-1 text-gray-400">/</span>
          )}
          <button
            className="flex items-center hover:underline hover:text-blue-600 truncate max-w-[150px]"
            onClick={() => navigateToFolder(item.id)}
          >
            {index === 0 && <Folder size={14} className="mr-1 text-blue-500" />}
            <span className="truncate">{item.name}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;
