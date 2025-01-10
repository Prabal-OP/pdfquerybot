import { useState, useRef } from 'react';
import { Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/FileUpload';
import Chat from '@/components/Chat';
import PDFPreview from '@/components/PDFPreview';
import Shorts from '@/components/Shorts';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const Index = () => {
  const [hasFile, setHasFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPdfCollapsed, setIsPdfCollapsed] = useState(true);
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
      pdfIframeRef.current.contentWindow?.postMessage({
        type: 'navigate',
        page: page - 1
      }, '*');
    }
  };

  const togglePdfCollapse = () => {
    setIsPdfCollapsed(!isPdfCollapsed);
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
            <ResizablePanel 
              defaultSize={isPdfCollapsed ? 10 : 50} 
              minSize={10}
              maxSize={50}
              className="relative"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10"
                onClick={togglePdfCollapse}
              >
                {isPdfCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              {selectedFile && <PDFPreview file={selectedFile} onLoad={handlePDFLoad} />}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={40}>
              <div className="h-full flex flex-col p-4">
                <Shorts />
                <Chat onPageChange={handlePageChange} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </div>
  );
};

export default Index;