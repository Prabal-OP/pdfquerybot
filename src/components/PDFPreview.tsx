import React from 'react';

interface PDFPreviewProps {
  file: File;
}

const PDFPreview = ({ file }: PDFPreviewProps) => {
  const url = URL.createObjectURL(file);

  React.useEffect(() => {
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [url]);

  return (
    <div className="w-full h-full">
      <iframe
        src={url}
        className="w-full h-full border-0"
        title="PDF Preview"
      />
    </div>
  );
};

export default PDFPreview;