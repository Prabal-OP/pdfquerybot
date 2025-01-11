import { Check, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const Shorts = () => {
  const proxyShorts = [
    {
      id: '1',
      topic: 'Introduction to React',
      summary: 'Basic concepts and fundamentals of React framework',
      questions: [
        'What is JSX?',
        'Explain component lifecycle',
        'How does state management work?'
      ]
    },
    {
      id: '2',
      topic: 'State Management',
      summary: 'Different approaches to managing state in React applications',
      questions: [
        'What is Redux?',
        'Compare Context API vs Redux'
      ]
    },
    {
      id: '3',
      topic: 'React Hooks',
      summary: 'Understanding React hooks and their use cases',
      questions: [
        'What is useState?',
        'How does useEffect work?',
        'What are custom hooks?'
      ]
    }
  ];

  return (
    <div className="w-full mb-6">
      <Carousel className="w-full">
        <CarouselContent>
          {proxyShorts.map((short) => (
            <CarouselItem key={short.id} className="md:basis-1/3">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{short.topic}</span>
                    <Grid3X3 className="h-5 w-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground mb-4">{short.summary}</p>
                  <div className="space-y-2 flex-1">
                    {short.questions.map((question, index) => (
                      <p key={index} className="text-sm">
                        {index + 1}. {question}
                      </p>
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
};

export default Shorts;