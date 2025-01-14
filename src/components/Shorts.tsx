import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Check, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
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
            options!fk_question (
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

  const handleMarkAsComplete = async (shortId: string) => {
    const currentShortIndex = shorts.findIndex(s => s.id === shortId);
    if (currentShortIndex > -1) {
      const updatedShorts = shorts.filter((_, index) => index !== currentShortIndex);
      setShorts(updatedShorts);
      toast({
        title: "Success",
        description: "Short marked as complete!",
      });
    }
  };

  if (loading) {
    return <div className="w-full h-[60vh] text-center py-8">Loading shorts...</div>;
  }

  if (!shorts.length) {
    return <div className="w-full h-[60vh] text-center py-8">No shorts available yet. Upload a PDF to generate some!</div>;
  }

  return (
    <div className="w-full h-[60vh]">
      <Carousel className="w-full h-full" opts={{ 
        align: "start",
        slidesToScroll: 1,
        containScroll: "trimSnaps"
      }}>
        <CarouselContent className="-ml-4">
          {shorts.map((short) => (
            <CarouselItem key={short.id} className="pl-4 basis-1/2">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{short.topic_name}</span>
                    <Grid3X3 className="h-5 w-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col overflow-hidden">
                  <p className="text-sm text-muted-foreground mb-4">{short.topic_summary}</p>
                  <div className="flex-1 overflow-y-auto">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {short.questions?.map((question, index) => (
                          <CarouselItem key={question.id}>
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium">
                                Question {index + 1} of {short.questions.length}:
                                <br />
                                {question.question_text}
                              </h3>
                              <RadioGroup
                                value={selectedAnswers[question.id]}
                                onValueChange={(value) => 
                                  setSelectedAnswers(prev => ({
                                    ...prev,
                                    [question.id]: value
                                  }))
                                }
                                className="space-y-2"
                              >
                                {question.options?.map((option) => (
                                  <div key={option.id} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option.id} id={option.id} />
                                    <label htmlFor={option.id} className="text-sm">
                                      {option.option_text}
                                    </label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </div>
                  <Button 
                    className="w-full mt-4"
                    onClick={() => handleMarkAsComplete(short.id)}
                  >
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