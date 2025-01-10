import { useState } from 'react';
import { Check, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Short {
  id: string;
  topic_name: string;
  topic_summary: string;
  status: 'draft' | 'completed';
}

interface Question {
  id: string;
  short_id: string;
  question_text: string;
}

const Shorts = () => {
  const { toast } = useToast();
  const [currentGroup, setCurrentGroup] = useState(0);

  const { data: shorts = [] } = useQuery({
    queryKey: ['shorts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shorts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Short[];
    }
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*');
      
      if (error) throw error;
      return data as Question[];
    }
  });

  const handleMarkComplete = async (shortId: string) => {
    const { error } = await supabase
      .from('shorts')
      .update({ status: 'completed' })
      .eq('id', shortId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark short as complete",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Short marked as complete"
      });
    }
  };

  const getQuestionsForShort = (shortId: string) => {
    return questions.filter(q => q.short_id === shortId);
  };

  return (
    <div className="w-full mb-6">
      <Carousel className="w-full">
        <CarouselContent>
          {shorts.map((short) => (
            <CarouselItem key={short.id} className="md:basis-1/3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{short.topic_name}</span>
                    <Grid3X3 className="h-5 w-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{short.topic_summary}</p>
                  <div className="space-y-2">
                    {getQuestionsForShort(short.id).map((question, index) => (
                      <p key={question.id} className="text-sm">
                        {index + 1}. {question.question_text}
                      </p>
                    ))}
                  </div>
                  <Button 
                    onClick={() => handleMarkComplete(short.id)}
                    disabled={short.status === 'completed'}
                    className="w-full"
                    variant={short.status === 'completed' ? 'outline' : 'default'}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {short.status === 'completed' ? 'Completed' : 'Mark as Complete'}
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
};

export default Shorts;