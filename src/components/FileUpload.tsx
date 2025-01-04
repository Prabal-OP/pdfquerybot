import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      setErrorMessage('Please upload a PDF file');
      setUploadStatus('error');
      return;
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setErrorMessage('File size must be less than 50MB');
      setUploadStatus('error');
      return;
    }
    setUploadStatus('success');
    onFileSelect(file);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-500",
          uploadStatus === 'error' && "border-red-500 bg-red-50",
          uploadStatus === 'success' && "border-green-500 bg-green-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          {uploadStatus === 'success' ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : uploadStatus === 'error' ? (
            <AlertCircle className="h-12 w-12 text-red-500" />
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}
          
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-medium">
              {uploadStatus === 'success' 
                ? 'PDF uploaded successfully!' 
                : uploadStatus === 'error'
                ? errorMessage
                : isDragActive
                ? 'Drop your PDF here'
                : 'Drag & drop your PDF here, or click to select'}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Maximum file size: 50MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;