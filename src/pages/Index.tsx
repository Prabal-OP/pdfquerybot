import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import Chat from '@/components/Chat';
import PDFPreview from '@/components/PDFPreview';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const Index = () => {
  const [hasFile, setHasFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    console.log('Selected file:', file.name);
    setSelectedFile(file);
    setHasFile(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!hasFile ? (
        <div className="py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                PDF Chat Assistant
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Upload your PDF and start asking questions about its content
              </p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        </div>
      ) : (
        <div className="h-screen">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={30}>
              {selectedFile && <PDFPreview file={selectedFile} />}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <Chat />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </div>
  );
};

export default Index;