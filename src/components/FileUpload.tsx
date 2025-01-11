import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    setUploadStatus('uploading');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Upload the PDF
      const { data: uploadData, error: uploadError } = await supabase.functions.invoke('upload-pdf', {
        body: formData,
      });

      if (uploadError) {
        throw uploadError;
      }

      // Initialize shorts from the uploaded PDF
      const { error: initError } = await supabase.functions.invoke('initialize-shorts');
      
      if (initError) {
        console.error('Error initializing shorts:', initError);
        toast({
          variant: "destructive",
          title: "Warning",
          description: "PDF uploaded but failed to generate shorts. Please try again.",
        });
      }

      setUploadStatus('success');
      toast({
        title: "Success",
        description: "PDF uploaded and shorts generated successfully!",
      });
      onFileSelect(file);
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage('Failed to upload file. Please try again.');
      setUploadStatus('error');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload PDF. Please try again.",
      });
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      setErrorMessage('Please upload a PDF file');
      setUploadStatus('error');
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF file.",
      });
      return;
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setErrorMessage('File size must be less than 50MB');
      setUploadStatus('error');
      toast({
        variant: "destructive",
        title: "File too large",
        description: "File size must be less than 50MB.",
      });
      return;
    }
    
    await uploadFile(file);
  }, [onFileSelect, toast]);

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
          uploadStatus === 'success' && "border-green-500 bg-green-50",
          uploadStatus === 'uploading' && "border-blue-500 bg-blue-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          {uploadStatus === 'success' ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : uploadStatus === 'error' ? (
            <AlertCircle className="h-12 w-12 text-red-500" />
          ) : (
            <Upload className={cn(
              "h-12 w-12",
              uploadStatus === 'uploading' ? "text-blue-500 animate-pulse" : "text-gray-400"
            )} />
          )}
          
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-medium">
              {uploadStatus === 'success' 
                ? 'PDF uploaded and shorts generated successfully!' 
                : uploadStatus === 'error'
                ? errorMessage
                : uploadStatus === 'uploading'
                ? 'Uploading PDF...'
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