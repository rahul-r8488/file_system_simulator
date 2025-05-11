
import React from 'react';
import { getFileExtension } from '@/utils/fileSystemUtils';
import { File, FileText, Folder } from 'lucide-react';

interface FileIconProps {
  fileName: string;
  isFolder: boolean;
  size?: number;
}

const FileIcon: React.FC<FileIconProps> = ({ fileName, isFolder, size = 16 }) => {
  if (isFolder) {
    return <Folder size={size} className="text-blue-500" />;
  }
  
  const extension = getFileExtension(fileName);
  
  // Define icon mapping based on file extension
  switch (extension) {
    case 'txt':
    case 'md':
      return <FileText size={size} className="text-gray-500" />;
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileText size={size} className="text-yellow-500" />;
    case 'css':
    case 'scss':
      return <FileText size={size} className="text-blue-400" />;
    case 'html':
      return <FileText size={size} className="text-orange-500" />;
    case 'json':
      return <FileText size={size} className="text-green-500" />;
    case 'c':
    case 'cpp':
    case 'h':
      return <FileText size={size} className="text-purple-500" />;
    case 'py':
      return <FileText size={size} className="text-blue-600" />;
    case 'java':
      return <FileText size={size} className="text-red-500" />;
    default:
      return <File size={size} className="text-gray-500" />;
  }
};

export default FileIcon;
