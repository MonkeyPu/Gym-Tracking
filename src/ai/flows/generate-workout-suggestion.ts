'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating workout suggestions based on user goals, training history, and available equipment.
 *
 * - generateWorkoutSuggestion - A function that generates workout suggestions.
 * - GenerateWorkoutSuggestionInput - The input type for the generateWorkoutSuggestion function.
 * - GenerateWorkoutSuggestionOutput - The output type for the generateWorkoutSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWorkoutSuggestionInputSchema = z.object({
  goals: z
    .string()
    .describe(
      'The user’s fitness goals (e.g., muscle gain, weight loss, general fitness).'
    ),
  trainingHistory: z
    .string()
    .describe(
      'A summary of the user’s past workout routines, exercises, and progress.  Include duration and intensity of previous workouts.'
    ),
  availableEquipment: z
    .string()
    .describe(
      'A list of equipment available to the user (e.g., dumbbells, bench, resistance bands, bodyweight only).'
    ),
  bodyWeight: z.number().describe('The user’s current body weight in kilograms.'),
  height: z.number().describe('The user’s height in centimeters.'),
  age: z.number().optional().describe('The user’s age in years.'),
});
export type GenerateWorkoutSuggestionInput = z.infer<
  typeof GenerateWorkoutSuggestionInputSchema
>;

const GenerateWorkoutSuggestionOutputSchema = z.object({
  suggestedWorkout: z
    .string()
    .describe(
      'A detailed workout plan tailored to the user, including specific exercises, sets, reps, and rest times. This should be formatted for easy readability in a mobile app.'
    ),
  reasoning: z
    .string()
    .describe(
      'Explanation of why these exercises will help achieve user goals, based on their training history and available equipment.  Reference their provided data, and progressive overload principles.'
    ),
  estimatedStrengthIncrease: z
    .string()
    .describe(
      'An estimate of strength increase per exercise (e.g., 5-10% increase in bench press weight) over the next week. NOTE: This is an estimate only, not medical advice.'
    ),
  generalMuscleGrowthTrend: z
    .string()
    .describe(
      'A general assessment of muscle growth trend (slow / moderate / fast) based on the workout plan. NOTE: This is an estimate only, not medical advice.'
    ),
});
export type GenerateWorkoutSuggestionOutput = z.infer<
  typeof GenerateWorkoutSuggestionOutputSchema
>;

export async function generateWorkoutSuggestion(
  input: GenerateWorkoutSuggestionInput
): Promise<GenerateWorkoutSuggestionOutput> {
  return generateWorkoutSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkoutSuggestionPrompt',
  input: {schema: GenerateWorkoutSuggestionInputSchema},
  output: {schema: GenerateWorkoutSuggestionOutputSchema},
  prompt: `You are an expert personal trainer who provides tailored workout suggestions to users based on their goals, training history, available equipment, and body data.

  Provide workout suggestions that are safe and effective.
  Clearly label any predictions as estimates, and not medical advice.

  Goals: {{{goals}}}
  Training History: {{{trainingHistory}}}
  Available Equipment: {{{availableEquipment}}}
  Body Weight: {{{bodyWeight}}} kg
  Height: {{{height}}} cm
  {{#if age}}Age: {{{age}}} years{{/if}}

  Based on this information, provide a detailed workout plan including specific exercises, sets, reps, and rest times. Explain why these exercises will help achieve the user's goals, referencing their provided data and progressive overload principles. Also, provide an estimate of strength increase per exercise over the next week and a general assessment of muscle growth trend. State clearly that the strength increase and muscle growth are estimates only, not medical advice.`,
});

const generateWorkoutSuggestionFlow = ai.defineFlow(
  {
    name: 'generateWorkoutSuggestionFlow',
    inputSchema: GenerateWorkoutSuggestionInputSchema,
    outputSchema: GenerateWorkoutSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
