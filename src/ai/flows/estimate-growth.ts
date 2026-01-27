// estimate-growth.ts
'use server';
/**
 * @fileOverview Estimates strength progression and muscle growth trends based on workout data.
 *
 * - estimateGrowth - A function that estimates growth based on user data and workout history.
 * - EstimateGrowthInput - The input type for the estimateGrowth function.
 * - EstimateGrowthOutput - The return type for the estimateGrowth function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateGrowthInputSchema = z.object({
  workoutConsistency: z.number().describe('A measure of workout consistency (e.g., percentage of scheduled workouts completed).'),
  progressiveOverload: z.number().describe('A measure of progressive overload (e.g., percentage increase in weight lifted over time).'),
  bodyWeightChange: z.number().describe('Change in body weight (in kg).'),
  trainingVolume: z.number().describe('Total training volume (sets x reps x weight) over a period of time.'),
});
export type EstimateGrowthInput = z.infer<typeof EstimateGrowthInputSchema>;

const EstimateGrowthOutputSchema = z.object({
  estimatedStrengthIncrease: z.string().describe('Estimated strength increase per exercise (e.g., 5-10% increase in bench press).'),
  muscleGrowthTrend: z.string().describe('General muscle growth trend (slow / moderate / fast).'),
});
export type EstimateGrowthOutput = z.infer<typeof EstimateGrowthOutputSchema>;

export async function estimateGrowth(input: EstimateGrowthInput): Promise<EstimateGrowthOutput> {
  return estimateGrowthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateGrowthPrompt',
  input: {schema: EstimateGrowthInputSchema},
  output: {schema: EstimateGrowthOutputSchema},
  prompt: `You are a personal trainer AI that provides fitness advice.

  Based on the following information, estimate the strength progression and muscle growth trends.
  Note: This is an estimate only and not medical advice. Do not give medical advice.

  Workout Consistency: {{{workoutConsistency}}}
  Progressive Overload: {{{progressiveOverload}}}
  Body Weight Change: {{{bodyWeightChange}}}
  Training Volume: {{{trainingVolume}}}

  Estimate strength increase per exercise and provide a general muscle growth trend (slow / moderate / fast). Return your output as a JSON object.
  Ensure that the strength increases are represented as strings.
  `,
});

const estimateGrowthFlow = ai.defineFlow(
  {
    name: 'estimateGrowthFlow',
    inputSchema: EstimateGrowthInputSchema,
    outputSchema: EstimateGrowthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
