
import React from 'react';
import { useFileSystem } from '@/context/FileSystemContext';
import { Progress } from '@/components/ui/progress';

export const DiskUsageInfo: React.FC = () => {
  const { state } = useFileSystem();
  const { diskSize, usedBlocks } = state;
  
  const usedSpace = usedBlocks.length;
  const freeSpace = diskSize - usedSpace;
  const usagePercentage = (usedSpace / diskSize) * 100;
  
  return (
    <div className="p-4 border-t">
      <div className="text-sm mb-1 flex justify-between">
        <span>Disk Usage</span>
        <span className={usagePercentage > 90 ? 'text-red-500' : 'text-gray-500'}>
          {usedSpace} / {diskSize} blocks ({usagePercentage.toFixed(1)}%)
        </span>
      </div>
      <Progress value={usagePercentage} className="h-2" />
      <div className="text-xs text-gray-500 mt-1 flex justify-between">
        <span>Used: {usedSpace} blocks</span>
        <span>Free: {freeSpace} blocks</span>
      </div>
    </div>
  );
};
