import { useState, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/FileUpload';
import Chat from '@/components/Chat';
import PDFPreview from '@/components/PDFPreview';
import Shorts, { ShortsRef } from '@/components/Shorts';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const Index = () => {
  const [hasFile, setHasFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPdf, setShowPdf] = useState(false);
  const pdfIframeRef = useRef<HTMLIFrameElement | null>(null);
  const shortsRef = useRef<ShortsRef>(null);

  const handleFileSelect = (file: File) => {
    console.log('Selected file:', file.name);
    setSelectedFile(file);
    setHasFile(true);
  };

  const handleShortsInitialized = () => {
    if (shortsRef.current) {
      shortsRef.current.fetchShorts();
    }
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

  const togglePdfVisibility = () => {
    setShowPdf(!showPdf);
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
            <FileUpload 
              onFileSelect={handleFileSelect} 
              onShortsInitialized={handleShortsInitialized}
            />
          </div>
        </div>
      ) : (
        <div className="h-screen">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePdfVisibility}
            className="fixed top-4 left-4 z-50"
          >
            {showPdf ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPdf ? 'Hide PDF' : 'Show PDF'}
          </Button>
          
          <ResizablePanelGroup direction="horizontal">
            {showPdf && (
              <>
                <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
                  {selectedFile && <PDFPreview file={selectedFile} onLoad={handlePDFLoad} />}
                </ResizablePanel>
                <ResizableHandle withHandle />
              </>
            )}
            <ResizablePanel defaultSize={showPdf ? 60 : 100}>
              <div className="h-full flex flex-col p-4 pt-16">
                <Shorts ref={shortsRef} />
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