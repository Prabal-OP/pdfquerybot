import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

interface PDFPreviewProps {
  file: File;
}

type PDFFile = Database['public']['Tables']['pdf_files']['Row'];

const PDFPreview = ({ file }: PDFPreviewProps) => {
  const url = URL.createObjectURL(file);
  const { toast } = useToast();

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
          toast({
            title: "PDF Update",
            description: `PDF ${payload.eventType}: ${payload.new?.filename || payload.old?.filename}`,
          });
        }
      )
      .subscribe();

    return () => {
      URL.revokeObjectURL(url);
      supabase.removeChannel(channel);
    };
  }, [url, toast]);

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