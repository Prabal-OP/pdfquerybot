import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Check, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface Short {
  id: string;
  topic_name: string;
  topic_summary: string;
  questions: {
    id: string;
    question_text: string;
    options: {
      id: string;
      option_text: string;
      is_correct: boolean;
    }[];
  }[];
}

export interface ShortsRef {
  fetchShorts: () => Promise<void>;
}

const Shorts = forwardRef<ShortsRef>((_, ref) => {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchShorts = async () => {
    try {
      setLoading(true);
      
      const { data: shortsData, error: shortsError } = await supabase
        .from('shorts')
        .select(`
          id,
          topic_name,
          topic_summary,
          questions!fk_short (
            id,
            question_text,
            options (
              id,
              option_text,
              is_correct
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (shortsError) throw shortsError;

      setShorts(shortsData || []);
    } catch (error) {
      console.error('Error fetching shorts:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load shorts. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchShorts
  }));

  useEffect(() => {
    fetchShorts();
  }, []);

  if (loading) {
    return <div className="w-full text-center py-8">Loading shorts...</div>;
  }

  if (!shorts.length) {
    return <div className="w-full text-center py-8">No shorts available yet. Upload a PDF to generate some!</div>;
  }

  return (
    <div className="w-full mb-6">
      <Carousel className="w-full">
        <CarouselContent>
          {shorts.map((short) => (
            <CarouselItem key={short.id} className="md:basis-1/3">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{short.topic_name}</span>
                    <Grid3X3 className="h-5 w-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground mb-4">{short.topic_summary}</p>
                  <div className="space-y-2 flex-1">
                    {short.questions?.map((question, index) => (
                      <div key={question.id} className="space-y-1">
                        <p className="text-sm font-medium">
                          {index + 1}. {question.question_text}
                        </p>
                        {question.options?.map((option) => (
                          <p key={option.id} className="text-sm pl-4 text-muted-foreground">
                            • {option.option_text}
                            {option.is_correct && <span className="text-green-500 ml-1">(✓)</span>}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4">
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Complete
                  </Button>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
});

Shorts.displayName = 'Shorts';

export default Shorts;