'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  generateWorkoutSuggestion,
  GenerateWorkoutSuggestionOutput,
} from '@/ai/flows/generate-workout-suggestion';
import { estimateGrowth, EstimateGrowthOutput } from '@/ai/flows/estimate-growth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MOCK_USER_PROFILE, MOCK_WORKOUT_LOGS } from '@/lib/data';
import { Wand2, Activity, Bot, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const suggestionSchema = z.object({
  goals: z.string().min(10, 'Please describe your goals in more detail.'),
  trainingHistory: z.string().min(10, 'Please provide more details about your training history.'),
  availableEquipment: z.string().min(3, 'Please list your available equipment.'),
});

const SuggestionResult = ({ data }: { data: GenerateWorkoutSuggestionOutput }) => (
    <Card className="mt-6 bg-muted/30">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bot className="w-6 h-6 text-primary"/> Your AI-Generated Workout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <h3 className="font-semibold text-lg">Suggested Workout</h3>
                <p className="whitespace-pre-wrap text-muted-foreground">{data.suggestedWorkout}</p>
            </div>
            <Separator/>
            <div>
                <h3 className="font-semibold text-lg">Reasoning</h3>
                <p className="text-muted-foreground">{data.reasoning}</p>
            </div>
            <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertTitle>Growth Estimation</AlertTitle>
                <AlertDescription>
                    <p><strong>Strength:</strong> {data.estimatedStrengthIncrease}</p>
                    <p><strong>Muscle Growth:</strong> {data.generalMuscleGrowthTrend}</p>
                    <p className="text-xs mt-2">Note: This is an estimate only, not medical advice.</p>
                </AlertDescription>
            </Alert>
        </CardContent>
    </Card>
);

const GrowthResult = ({ data }: { data: EstimateGrowthOutput }) => (
    <Card className="mt-6 bg-muted/30">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bot className="w-6 h-6 text-primary"/> Your Growth Estimate</CardTitle>
        </CardHeader>
        <CardContent>
            <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertTitle>Growth Projection</AlertTitle>
                <AlertDescription>
                    <p><strong>Estimated Strength Increase:</strong> {data.estimatedStrengthIncrease}</p>
                    <p><strong>Muscle Growth Trend:</strong> {data.muscleGrowthTrend}</p>
                    <p className="text-xs mt-2">Note: This is an estimate only, not medical advice.</p>
                </AlertDescription>
            </Alert>
        </CardContent>
    </Card>
)

export default function AiPredictionsPage() {
  const [suggestionResult, setSuggestionResult] = useState<GenerateWorkoutSuggestionOutput | null>(null);
  const [growthResult, setGrowthResult] = useState<EstimateGrowthOutput | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);

  const form = useForm<z.infer<typeof suggestionSchema>>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      goals: 'Gain muscle and increase bench press strength.',
      trainingHistory: 'Been working out for 2 years, following a push-pull-legs split. Current bench press 1RM is 100kg.',
      availableEquipment: 'Barbell, dumbbells, bench, squat rack, pull-up bar.',
    },
  });

  async function onSuggestionSubmit(values: z.infer<typeof suggestionSchema>) {
    setIsSuggesting(true);
    setSuggestionResult(null);
    try {
      const result = await generateWorkoutSuggestion({
        ...values,
        bodyWeight: MOCK_USER_PROFILE.weight,
        height: MOCK_USER_PROFILE.height,
        age: MOCK_USER_PROFILE.age,
      });
      setSuggestionResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSuggesting(false);
    }
  }

  async function handleEstimateGrowth() {
    setIsEstimating(true);
    setGrowthResult(null);
    try {
        // Dummy data derived from mocks for demonstration
        const result = await estimateGrowth({
            workoutConsistency: 0.85, // 85%
            progressiveOverload: 1.05, // 5% increase
            bodyWeightChange: 0.5, // 0.5kg gain
            trainingVolume: MOCK_WORKOUT_LOGS.reduce((acc, log) => acc + log.entries.reduce((sum, entry) => sum + entry.sets.reduce((s, set) => s + set.reps * set.weight, 0), 0), 0)
        });
        setGrowthResult(result);
    } catch (error) {
        console.error(error);
    } finally {
        setIsEstimating(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2"><Wand2 className="text-primary"/>Workout Suggestion Generator</CardTitle>
          <CardDescription>
            Get a personalized workout plan based on your goals and available equipment.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSuggestionSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Fitness Goals</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., build muscle, lose weight, improve cardio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trainingHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Training History</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., beginner, 3 times a week, focus on free weights" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availableEquipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Equipment</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., dumbbells, resistance bands, bodyweight" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSuggesting}>
                {isSuggesting ? 'Generating...' : 'Generate Workout'}
              </Button>
            </CardFooter>
          </form>
        </Form>
        {suggestionResult && <SuggestionResult data={suggestionResult} />}
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2"><Activity className="text-primary"/>Estimate My Growth</CardTitle>
            <CardDescription>
                Use your logged workout data to predict your strength and muscle growth trends.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">Click the button below to analyze your recent performance and generate a growth estimate based on your consistency, progressive overload, and training volume.</p>
        </CardContent>
        <CardFooter>
            <Button onClick={handleEstimateGrowth} disabled={isEstimating}>
                {isEstimating ? 'Estimating...' : 'Estimate Growth'}
            </Button>
        </CardFooter>
        {growthResult && <GrowthResult data={growthResult} />}
      </Card>
    </div>
  );
}
