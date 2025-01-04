import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import Chat from '@/components/Chat';

const Index = () => {
  const [hasFile, setHasFile] = useState(false);

  const handleFileSelect = (file: File) => {
    console.log('Selected file:', file.name);
    setHasFile(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            PDF Chat Assistant
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Upload your PDF and start asking questions about its content
          </p>
        </div>

        {!hasFile ? (
          <FileUpload onFileSelect={handleFileSelect} />
        ) : (
          <Chat />
        )}
      </div>
    </div>
  );
};

export default Index;