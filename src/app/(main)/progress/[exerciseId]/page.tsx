'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { PRELOADED_EXERCISES, BODYWEIGHT_FACTORS } from '@/lib/data';
import { type WorkoutLog, type Exercise, type UserProfile } from '@/lib/types';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { calculateLinearRegression } from '@/lib/predictions';

const PREDICTION_POINTS = 3;
const HISTORY_POINTS = 4;
const TOTAL_CHART_POINTS = HISTORY_POINTS + PREDICTION_POINTS;

const processExerciseDataForChart = (logs: WorkoutLog[], exerciseId: string, exercise: Exercise | undefined, userWeight: number) => {
    if (!exercise) return [];
    
    const performanceByDate = new Map<string, number>();

    logs.forEach((log) => {
        const entry = log.entries.find(e => e.exerciseId === exerciseId);
        if (entry) {
            const set10RMs = entry.sets
                .filter(set => set.reps > 0)
                .map(set => {
                    let totalWeight = set.weight;
                    if (exercise.isBodyweight) {
                        const factor = BODYWEIGHT_FACTORS[exercise.name.trim()] || 0;
                        const bodyWeightComponent = (userWeight || 0) * factor;
                        totalWeight += bodyWeightComponent;
                    }
                    return totalWeight > 0 ? totalWeight * (set.reps + 30) / 40 : 0;
                })
                .filter(rm => rm > 0);

            if (set10RMs.length > 0) {
                const average10RM = set10RMs.reduce((sum, val) => sum + val, 0) / set10RMs.length;
                performanceByDate.set(log.date, average10RM);
            }
        }
    });
    
    const sortedChartData = Array.from(performanceByDate.entries())
    .map(([date, performance]) => ({
      date,
      performance: Math.round(performance),
      formattedDate: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const regressionPoints = sortedChartData.slice(-6).map((p, i) => ({ x: i, y: p.performance }));
    const { slope, intercept } = calculateLinearRegression(regressionPoints);

    const displayData: { date: string; performance: number | null; prediction: number | null; formattedDate: string }[] = [];
    const recentLogs = sortedChartData.slice(-HISTORY_POINTS);

    const emptyPastSlots = HISTORY_POINTS - recentLogs.length;
    for (let i = 0; i < emptyPastSlots; i++) {
        displayData.push({ date: `past-empty-${i}`, performance: null, prediction: null, formattedDate: '' });
    }

    recentLogs.forEach(log => {
        displayData.push({ ...log, prediction: null });
    });

    const futureSlots = TOTAL_CHART_POINTS - displayData.length;
    if (sortedChartData.length > 1) {
        const lastPerformanceIndex = displayData.length - 1;
        if (lastPerformanceIndex >= 0 && displayData[lastPerformanceIndex].performance !== null) {
            displayData[lastPerformanceIndex].prediction = displayData[lastPerformanceIndex].performance;
        }

        const lastHistoricalIndex = regressionPoints.length - 1;
        let lastValue = sortedChartData.at(-1)!.performance;
        
        for (let i = 1; i <= futureSlots; i++) {
            const predictionX = lastHistoricalIndex + i;
            let predictedPerformance = (slope * predictionX) + intercept;
            
            predictedPerformance = Math.max(predictedPerformance, lastValue);
            
            const futureDate = new Date(sortedChartData.at(-1)!.date);
            futureDate.setDate(futureDate.getDate() + 7 * i);
            
            displayData.push({
                date: `future-${i}`,
                performance: null,
                prediction: Math.round(predictedPerformance),
                formattedDate: futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            });
            lastValue = predictedPerformance;
        }
    } else {
         for (let i = 0; i < futureSlots; i++) {
            displayData.push({ date: `future-empty-${i}`, performance: null, prediction: null, formattedDate: '' });
        }
    }

    return displayData;
};

const chartConfig = {
    performance: {
      label: 'Est. 10RM (kg)',
      color: 'hsl(var(--primary))',
    },
    prediction: {
        label: 'Prediction (kg)',
        color: 'hsl(var(--primary))',
    }
} satisfies ChartConfig;

export default function ExerciseProgressPage({ params }: { params: { exerciseId: string } }) {
    const [logs, setLogs] = useState<WorkoutLog[]>([]);
    const [allExercises, setAllExercises] = useState<Exercise[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile>({ name: '', weight: 0, height: 0 });
    const [showPredictions, setShowPredictions] = useState(true);
    const { exerciseId } = params;

    useEffect(() => {
        const savedLogs = localStorage.getItem('user-workout-logs');
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        }

        const savedRoutines = localStorage.getItem('user-routines');
        const allExercisesMap = new Map<string, Exercise>();

        PRELOADED_EXERCISES.forEach(ex => allExercisesMap.set(ex.id, ex));

        if (savedRoutines) {
            const parsedRoutines = JSON.parse(savedRoutines);
            const routineExercises = Object.values(parsedRoutines).flat() as Exercise[];
            routineExercises.forEach(routineEx => {
                const existingEx = allExercisesMap.get(routineEx.id);
                allExercisesMap.set(routineEx.id, { ...existingEx, ...routineEx });
            });
        }
        setAllExercises(Array.from(allExercisesMap.values()));


        const savedProfile = localStorage.getItem('user-profile');
        if (savedProfile) {
            setUserProfile(JSON.parse(savedProfile));
        }
    }, []);

    const exercise = useMemo(() => allExercises.find(ex => ex.id === exerciseId), [allExercises, exerciseId]);
    const chartData = useMemo(() => processExerciseDataForChart(logs, exerciseId, exercise, userProfile.weight), [logs, exerciseId, exercise, userProfile.weight]);

    if (!exercise) {
        return (
             <div className="space-y-4">
                 <Button asChild variant="ghost" size="sm" className="mb-4">
                    <Link href="/progress"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Progress</Link>
                </Button>
                <div className="flex flex-col items-center justify-center h-[300px] text-center bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground font-semibold">Exercise not found.</p>
                </div>
             </div>
        )
    }

    const hasData = chartData.some(d => d.performance !== null);

    return (
        <div className="space-y-4">
             <Button asChild variant="ghost" size="sm">
                <Link href="/progress"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Progress</Link>
            </Button>
            <Card>
                <CardHeader className="flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold font-headline">{exercise.name} Progress</CardTitle>
                        <CardDescription>
                            Average estimated 10-rep max (e10RM) progression.
                        </CardDescription>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="show-predictions" checked={showPredictions} onCheckedChange={setShowPredictions} />
                        <Label htmlFor="show-predictions">Show Predictions</Label>
                    </div>
                </CardHeader>
                <CardContent>
                    {hasData ? (
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                             <LineChart
                                data={chartData}
                                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="formattedDate"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => `${value} kg`}
                                    domain={['dataMin - 5', 'dataMax + 5']}
                                />
                                <ChartTooltip
                                    cursor={true}
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Line
                                    dataKey="performance"
                                    type="monotone"
                                    stroke="var(--color-performance)"
                                    strokeWidth={3}
                                    dot={{ r: 5, fill: 'var(--color-performance)', stroke: 'var(--background)' }}
                                    activeDot={{ r: 8 }}
                                    connectNulls={false}
                                />
                                {showPredictions && (
                                    <Line
                                        dataKey="prediction"
                                        type="monotone"
                                        stroke="var(--color-prediction)"
                                        strokeWidth={3}
                                        strokeDasharray="5 5"
                                        dot={{ r: 5, fill: 'var(--color-prediction)', stroke: 'var(--background)' }}
                                        activeDot={{ r: 8 }}
                                        connectNulls={false}
                                    />
                                )}
                            </LineChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] text-center bg-muted/50 rounded-lg">
                            <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground font-semibold">No workout data found for {exercise.name}.</p>
                            <p className="text-sm text-muted-foreground mt-1">Log a workout to see your progress here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
