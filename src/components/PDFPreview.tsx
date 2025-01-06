import React, { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

interface PDFPreviewProps {
  file: File;
  onLoad?: (iframe: HTMLIFrameElement) => void;
}

type PDFFile = Database['public']['Tables']['pdf_files']['Row'];

const PDFPreview = ({ file, onLoad }: PDFPreviewProps) => {
  const url = URL.createObjectURL(file);
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pdf_files'
        },
        (payload: RealtimePostgresChangesPayload<PDFFile>) => {
          console.log('Change received!', payload);
          // Handle cases where new or old record might be empty objects
          const newRecord = payload.new as PDFFile | undefined;
          const oldRecord = payload.old as PDFFile | undefined;
          const filename = newRecord?.filename || oldRecord?.filename || 'unknown file';
          
          toast({
            title: "PDF Update",
            description: `PDF ${payload.eventType}: ${filename}`,
          });
        }
      )
      .subscribe();

    if (iframeRef.current && onLoad) {
      onLoad(iframeRef.current);
    }

    return () => {
      URL.revokeObjectURL(url);
      supabase.removeChannel(channel);
    };
  }, [url, toast, onLoad]);

  return (
    <div className="w-full h-full">
      <iframe
        ref={iframeRef}
        src={url}
        className="w-full h-full border-0"
        title="PDF Preview"
      />
    </div>
  );
};

export default PDFPreview;