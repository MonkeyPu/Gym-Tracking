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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, ChevronsUpDown, TrendingUp, ChevronRight, Dumbbell, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_WORKOUT_LOGS,
  PRELOADED_EXERCISES,
  MUSCLE_GROUPS,
  BODYWEIGHT_FACTORS,
  MOCK_USER_PROFILE
} from '@/lib/data';
import {
  type WorkoutLog,
  type Exercise,
  type UserProfile
} from '@/lib/types';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import Link from 'next/link';


const processMuscleGroupDataForChart = (
  logs: WorkoutLog[],
  allExercises: Exercise[],
  muscleGroup: string,
  userWeight: number
) => {
  const relevantExercises = allExercises.filter((ex) => ex.muscleGroup === muscleGroup);
  if (relevantExercises.length === 0) return [];

  const performanceByDate = new Map<string, number[]>();

  logs.forEach((log) => {
    const daily10RMs: number[] = [];
    
    relevantExercises.forEach(exercise => {
      const entry = log.entries.find((e) => e.exerciseId === exercise.id);
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
          const avgExercise10RM = set10RMs.reduce((sum, val) => sum + val, 0) / set10RMs.length;
          daily10RMs.push(avgExercise10RM);
        }
      }
    });

    if (daily10RMs.length > 0) {
      if (!performanceByDate.has(log.date)) {
        performanceByDate.set(log.date, []);
      }
      performanceByDate.get(log.date)!.push(...daily10RMs);
    }
  });

  const sortedChartData = Array.from(performanceByDate.entries())
    .map(([date, performances]) => ({
      date,
      performance: Math.round(performances.reduce((sum, val) => sum + val, 0) / performances.length),
      formattedDate: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalPoints = 7;
    const middleIndex = Math.floor(totalPoints / 2); // 3

    const pointsToTake = middleIndex + 1; // 4
    const recentLogs = sortedChartData.slice(-pointsToTake);

    const displayData: {date: string, performance: number | null, formattedDate: string}[] = [];
    const emptyPastSlots = pointsToTake - recentLogs.length;
    for (let i = 0; i < emptyPastSlots; i++) {
        displayData.push({ date: `past-empty-${i}`, performance: null, formattedDate: '' });
    }

    displayData.push(...recentLogs);

    const futureSlots = totalPoints - displayData.length;
    for (let i = 0; i < futureSlots; i++) {
        displayData.push({ date: `future-empty-${i}`, performance: null, formattedDate: '' });
    }

    return displayData;
};

const chartConfig = {
    performance: {
      label: 'Avg. e10RM (kg)',
      color: 'hsl(var(--primary))',
    },
} satisfies ChartConfig;

export default function ProgressPage() {
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(
    MUSCLE_GROUPS[0]
  );
  const [muscleGroupSearch, setMuscleSearch] = useState('');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER_PROFILE);


  useEffect(() => {
    const savedLogs = localStorage.getItem('user-workout-logs');
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    } else {
      setLogs(MOCK_WORKOUT_LOGS);
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

  const chartData = useMemo(
    () => processMuscleGroupDataForChart(logs, allExercises, selectedMuscleGroup, userProfile.weight),
    [logs, allExercises, selectedMuscleGroup, userProfile.weight]
  );
  
  const filteredMuscleGroups = MUSCLE_GROUPS.filter(group => group.toLowerCase().includes(muscleGroupSearch.toLowerCase()));
  const relevantExercises = useMemo(() => allExercises.filter(ex => ex.muscleGroup === selectedMuscleGroup), [allExercises, selectedMuscleGroup]);
  const hasData = chartData.some(d => d.performance !== null);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Collapsible open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2 p-0 h-auto"
                    >
                        <CardTitle className="text-2xl font-bold font-headline">{selectedMuscleGroup}</CardTitle>
                        <ChevronsUpDown className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                    <div className="p-0 border rounded-md">
                        <div className="p-2">
                        <Input 
                            placeholder="Search muscle groups..." 
                            value={muscleGroupSearch}
                            onChange={(e) => setMuscleSearch(e.target.value)}
                            className="h-9"
                        />
                        </div>
                        <ScrollArea className="h-[200px]">
                            <div className="p-2 pt-0">
                            {filteredMuscleGroups.length > 0 ? (
                            filteredMuscleGroups.map(group => (
                                <Button
                                    key={group}
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => {
                                        setSelectedMuscleGroup(group);
                                        setIsSelectorOpen(false);
                                        setMuscleSearch('');
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedMuscleGroup === group ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {group}
                                </Button>
                            ))
                            ) : (
                                <p className="text-center text-sm text-muted-foreground p-4">No muscle group found.</p>
                            )}
                            </div>
                        </ScrollArea>
                    </div>
                </CollapsibleContent>
              </Collapsible>
              <CardDescription className="mt-1.5">
                Average Estimated 10-Rep Max (e10RM) progression.
              </CardDescription>
            </div>

            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-4 -mt-1 h-8 w-8 shrink-0">
                        <Info className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Exercises for {selectedMuscleGroup}</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh]">
                        <div className="space-y-2 p-1">
                            {relevantExercises.length > 0 ? (
                                relevantExercises.map(ex => (
                                  <DialogClose asChild key={ex.id}>
                                    <Link href={`/progress/${ex.id}`} className="block">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Dumbbell className="h-5 w-5 text-muted-foreground"/>
                                                <p className="font-semibold">{ex.name}</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    </Link>
                                  </DialogClose>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm text-center py-4">No exercises found for this muscle group.</p>
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

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
                  tickFormatter={(value) => value}
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
                  dot={{
                    r: 5,
                    fill: 'var(--color-performance)',
                    stroke: 'var(--background)'
                  }}
                  activeDot={{
                    r: 8,
                  }}
                  connectNulls={false}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center bg-muted/50 rounded-lg">
                <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-semibold">No workout data found for {selectedMuscleGroup}.</p>
              <p className="text-sm text-muted-foreground mt-1">Log a workout to see your progress here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
