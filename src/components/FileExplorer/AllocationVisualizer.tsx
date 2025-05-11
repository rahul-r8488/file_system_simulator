
import React from 'react';
import { useFileSystem } from '@/context/FileSystemContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileSystemNode } from '@/types/fileSystem';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AllocationVisualizerProps {
  fileId: string;
}

const BlockVisualization: React.FC<{ 
  node: FileSystemNode;
  diskSize: number;
  usedBlocks: number[];
}> = ({ node, diskSize, usedBlocks }) => {
  const { blocks, indexBlock, allocationMethod } = node;
  const usedBlocksSet = new Set(usedBlocks);
  
  if (!blocks || blocks.length === 0) {
    return <div className="text-red-500">No blocks allocated</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Allocation Method: {allocationMethod}</h3>
        <div className="text-sm">
          <p>Total Blocks: {blocks.length}</p>
          {indexBlock !== undefined && <p>Index Block: {indexBlock}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Block Visualization</h3>
        <div className="grid grid-cols-10 gap-1 text-xs text-center">
          {Array.from({ length: Math.min(100, diskSize) }, (_, i) => {
            const isFileBlock = blocks.includes(i);
            const isIndexBlock = indexBlock === i;
            const isUsed = usedBlocksSet.has(i) && !isFileBlock && !isIndexBlock;
            
            let bgColor = 'bg-gray-100';
            let textColor = 'text-gray-400';
            
            if (isFileBlock) {
              bgColor = 'bg-blue-500';
              textColor = 'text-white';
            } else if (isIndexBlock) {
              bgColor = 'bg-purple-500';
              textColor = 'text-white';
            } else if (isUsed) {
              bgColor = 'bg-gray-400';
              textColor = 'text-white';
            }
            
            return (
              <div 
                key={i} 
                className={`${bgColor} ${textColor} p-1 rounded`}
                title={`Block ${i}: ${isFileBlock ? 'File Data' : isIndexBlock ? 'Index Block' : isUsed ? 'Used' : 'Free'}`}
              >
                {i}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2 text-xs mt-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
            <span>File Blocks</span>
          </div>
          {indexBlock !== undefined && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded mr-1"></div>
              <span>Index Block</span>
            </div>
          )}
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded mr-1"></div>
            <span>Other Used Blocks</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-100 rounded mr-1"></div>
            <span>Free Blocks</span>
          </div>
        </div>
      </div>
      
      {allocationMethod === 'contiguous' && (
        <div>
          <h3 className="text-sm font-medium">Contiguous Allocation</h3>
          <p className="text-sm text-gray-500">
            Blocks are allocated in a continuous sequence from {blocks[0]} to {blocks[blocks.length - 1]}.
          </p>
        </div>
      )}
      
      {allocationMethod === 'linked' && (
        <div>
          <h3 className="text-sm font-medium">Linked Allocation</h3>
          <p className="text-sm text-gray-500">
            Each block points to the next block in the sequence. First block: {blocks[0]}.
          </p>
          <div className="mt-2 text-xs">
            <div className="font-medium">Link Sequence:</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {blocks.map((block, index) => (
                <React.Fragment key={block}>
                  <span className="bg-blue-100 px-1 rounded">{block}</span>
                  {index < blocks.length - 1 && <span>→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {allocationMethod === 'indexed' && indexBlock !== undefined && (
        <div>
          <h3 className="text-sm font-medium">Indexed Allocation</h3>
          <p className="text-sm text-gray-500">
            The index block ({indexBlock}) contains pointers to all data blocks.
          </p>
          <div className="mt-2 text-xs">
            <div className="flex flex-wrap gap-1 mt-1">
              <div className="bg-purple-100 p-1 rounded-md">
                <div className="font-medium text-purple-800">Index Block ({indexBlock})</div>
                <div className="grid grid-cols-5 gap-1 mt-1">
                  {blocks.map((block, index) => (
                    <div key={index} className="bg-white px-1 py-0.5 rounded border border-purple-200 text-center">
                      {block}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AllocationVisualizer: React.FC<AllocationVisualizerProps> = ({ fileId }) => {
  const { state } = useFileSystem();
  const file = state.nodes[fileId];

  if (!file || file.type !== 'file') {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Allocation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Storage Allocation for {file.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96 overflow-y-auto pr-4">
          <BlockVisualization 
            node={file} 
            diskSize={state.diskSize} 
            usedBlocks={state.usedBlocks} 
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
