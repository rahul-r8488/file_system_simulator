
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

interface DropZoneProps {
  onFilesDrop: (files: File[]) => void;
  className?: string;
  acceptedFileTypes?: string[];
  children?: React.ReactNode;
  disabled?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({
  onFilesDrop,
  className,
  acceptedFileTypes,
  children,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Set up the drag and drop event listeners
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;
      
      if (disabled) return;

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        processFiles(droppedFiles);
      }
    };

    // Add event listeners
    dropZone.addEventListener('dragenter', handleDragEnter);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('drop', handleDrop);

    // Clean up
    return () => {
      dropZone.removeEventListener('dragenter', handleDragEnter);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, [disabled]);

  const processFiles = (files: File[]) => {
    // Check if files match accepted types if specified
    if (acceptedFileTypes && acceptedFileTypes.length > 0) {
      const validFiles = files.filter(file => {
        const fileType = file.type;
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        
        return acceptedFileTypes.some(type => {
          // Check if extension matches or mime type matches
          if (type.startsWith('.')) {
            return fileExtension === type.substring(1);
          }
          return fileType === type || type === '*/*';
        });
      });
      
      if (validFiles.length !== files.length) {
        toast.error("Some files were rejected. Only specific file types are allowed.");
        if (validFiles.length === 0) return;
        onFilesDrop(validFiles);
        return;
      }
    }
    
    // Process the files by calling the provided callback
    onFilesDrop(files);
    console.log('Files dropped:', files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      ref={dropZoneRef}
      className={cn(
        'relative rounded-lg border-2 border-dashed transition-colors cursor-pointer',
        {
          'border-primary bg-primary/5': isDragging,
          'border-gray-300 hover:border-primary/50': !isDragging && !disabled,
          'border-gray-200 bg-gray-50 cursor-not-allowed': disabled,
        },
        className
      )}
      onClick={triggerFileInput}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
        accept={acceptedFileTypes?.join(',')}
        disabled={disabled}
      />
      
      {children || (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <Upload className={cn(
            "h-10 w-10 mb-2",
            isDragging ? "text-primary animate-pulse-opacity" : "text-gray-400",
            disabled ? "text-gray-300" : ""
          )} />
          <p className={cn(
            "text-sm font-medium",
            isDragging ? "text-primary" : "text-gray-600",
            disabled ? "text-gray-400" : ""
          )}>
            Drag files here or click to browse
          </p>
          <p className={cn(
            "text-xs mt-1",
            isDragging ? "text-primary/70" : "text-gray-500",
            disabled ? "text-gray-400" : ""
          )}>
            {acceptedFileTypes?.length 
              ? `Accepted file types: ${acceptedFileTypes.join(', ')}` 
              : "All file types are accepted"}
          </p>
        </div>
      )}
    </div>
  );
};

export default DropZone;