import { useState, useRef } from 'react';
import FileUpload from '@/components/FileUpload';
import Chat from '@/components/Chat';
import PDFPreview from '@/components/PDFPreview';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const Index = () => {
  const [hasFile, setHasFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const pdfIframeRef = useRef<HTMLIFrameElement | null>(null);

  const handleFileSelect = (file: File) => {
    console.log('Selected file:', file.name);
    setSelectedFile(file);
    setHasFile(true);
  };

  const handlePDFLoad = (iframe: HTMLIFrameElement) => {
    pdfIframeRef.current = iframe;
  };

  const handlePageChange = (page: number) => {
    if (pdfIframeRef.current) {
      // Use the PDF viewer's API to navigate to the specified page
      // This example assumes the PDF viewer supports a postMessage interface
      pdfIframeRef.current.contentWindow?.postMessage({
        type: 'navigate',
        page: page - 1 // PDF viewers typically use 0-based page numbers
      }, '*');
    }
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
              {selectedFile && <PDFPreview file={selectedFile} onLoad={handlePDFLoad} />}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <Chat onPageChange={handlePageChange} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </div>
  );
};

export default Index;