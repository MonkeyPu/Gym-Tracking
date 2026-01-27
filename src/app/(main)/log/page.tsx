'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MOCK_SCHEDULE, MOCK_ROUTINES, BODYWEIGHT_FACTORS, MOCK_USER_PROFILE, PRELOADED_EXERCISES } from '@/lib/data';
import { type Day, type Exercise, type WorkoutLog, type WeeklySchedule, type UserProfile, type WorkoutLogEntry, type SetLog, ALL_DAYS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react';

const dayInitials: { initial: string; full: Day }[] = [
  { initial: 'S', full: 'Sunday' },
  { initial: 'M', full: 'Monday' },
  { initial: 'T', full: 'Tuesday' },
  { initial: 'W', full: 'Wednesday' },
  { initial: 'T', full: 'Thursday' },
  { initial: 'F', full: 'Friday' },
  { initial: 'S', full: 'Saturday' },
];

// Helper to get the current day of the week
const getToday = (): Day => {
    const dayIndex = new Date().getDay(); // 0 for Sunday, 1 for Monday etc.
    const reorderedDays: Day[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return reorderedDays[dayIndex];
};

const calculateExercise10RM = (
    entry: WorkoutLogEntry,
    exercise: Exercise,
    userWeight: number
): number => {
    if (!entry || entry.sets.length === 0) return 0;

    const set10RMs = entry.sets
        .filter(set => set.reps > 0)
        .map(set => {
            let totalWeight = set.weight;
            if (exercise.isBodyweight) {
                const factor = BODYWEIGHT_FACTORS[exercise.name.trim()] || 0;
                const bodyWeightComponent = (userWeight || 0) * factor;
                totalWeight += bodyWeightComponent;
            }
            
            if (totalWeight <= 0) return 0;

            return totalWeight * (set.reps + 30) / 40;
        })
        .filter(rm => rm > 0);

    if (set10RMs.length === 0) return 0;

    const average10RM = set10RMs.reduce((sum, val) => sum + val, 0) / set10RMs.length;
    return Math.round(average10RM);
};


const ExerciseLogger = ({ exercise, selectedDay, logs, setLogs, userWeight }: { exercise: Exercise, selectedDay: Day, logs: WorkoutLog[], setLogs: (logs: WorkoutLog[]) => void, userWeight: number }) => {
    const [isOpen, setIsOpen] = useState(false);

    const getLogForDay = (day: Day) => {
        const todayDate = new Date().toISOString().split('T')[0];
        // This is a simplified approach for mock data. In a real app, you would have a better way to get today's log.
        return logs.find(log => log.day === day && log.date === todayDate);
    };

    const logForDay = getLogForDay(selectedDay);
    const exerciseEntry = logForDay?.entries.find(e => e.exerciseId === exercise.id);
    
    const setsToRender = useMemo(() => {
        return exerciseEntry?.sets && exerciseEntry.sets.length > 0 ? exerciseEntry.sets : [{ id: 'set-initial', reps: 0, weight: 0 }];
    }, [exerciseEntry]);


    const est10RM = useMemo(() => exerciseEntry ? calculateExercise10RM(exerciseEntry, exercise, userWeight) : 0, [exerciseEntry, exercise, userWeight]);

    const handleSetChange = (setIndex: number, field: 'reps' | 'weight', value: string) => {
        const newLogs: WorkoutLog[] = JSON.parse(JSON.stringify(logs));
        const todayDate = new Date().toISOString().split('T')[0];
        let logToUpdate = newLogs.find((l: WorkoutLog) => l.day === selectedDay && l.date === todayDate);
        
        if (!logToUpdate) {
             logToUpdate = {
                id: `log-${Date.now()}`,
                date: todayDate,
                day: selectedDay,
                entries: [],
            };
            newLogs.push(logToUpdate);
        }

        let entryToUpdate = logToUpdate.entries.find((e: WorkoutLogEntry) => e.exerciseId === exercise.id);
        
        if (!entryToUpdate) {
            entryToUpdate = {
                exerciseId: exercise.id,
                sets: [],
            };
            logToUpdate.entries.push(entryToUpdate);
        }
        
        while(entryToUpdate.sets.length <= setIndex) {
            entryToUpdate.sets.push({ id: `set-new-${Date.now()}-${entryToUpdate.sets.length}`, reps: 0, weight: 0 });
        }

        const newSet = {
            ...entryToUpdate.sets[setIndex],
            id: entryToUpdate.sets[setIndex]?.id || `set-new-${Date.now()}`,
            [field]: Number(value)
        }
        
        const newSets = [
            ...entryToUpdate.sets.slice(0, setIndex),
            newSet,
            ...entryToUpdate.sets.slice(setIndex + 1)
        ];

        entryToUpdate.sets = newSets;
        setLogs(newLogs);
    };

    const handleAddSet = () => {
        const newLogs: WorkoutLog[] = JSON.parse(JSON.stringify(logs));
        const todayDate = new Date().toISOString().split('T')[0];
        let logToUpdate = newLogs.find((l: WorkoutLog) => l.day === selectedDay && l.date === todayDate);

        if (!logToUpdate) {
            logToUpdate = {
                id: `log-${Date.now()}`,
                date: todayDate,
                day: selectedDay,
                entries: [],
            };
            newLogs.push(logToUpdate);
        }

        let entryToUpdate = logToUpdate.entries.find((e: WorkoutLogEntry) => e.exerciseId === exercise.id);

        if (!entryToUpdate) {
            entryToUpdate = {
                exerciseId: exercise.id,
                sets: [],
            };
            logToUpdate.entries.push(entryToUpdate);
        }
        
        const lastSet = entryToUpdate.sets[entryToUpdate.sets.length - 1];
        entryToUpdate.sets.push({
            id: `set-${Date.now()}`,
            reps: lastSet?.reps || 0,
            weight: lastSet?.weight || 0,
        });

        setLogs(newLogs);
    };

    const handleDeleteSet = (setIndex: number) => {
        const newLogs = JSON.parse(JSON.stringify(logs));
        const todayDate = new Date().toISOString().split('T')[0];
        const logToUpdate = newLogs.find((l: WorkoutLog) => l.day === selectedDay && l.date === todayDate);
        if (!logToUpdate) return;

        const entryToUpdate = logToUpdate.entries.find((e: WorkoutLogEntry) => e.exerciseId === exercise.id);
        if (!entryToUpdate) return;

        entryToUpdate.sets.splice(setIndex, 1);
        setLogs(newLogs);
    }

    const handleSaveLog = () => {
        // The saving now happens on change, so this button just provides feedback and closes the collapsible.
        setIsOpen(false);
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <p className="font-semibold">{exercise.name}</p>
                <div className="flex items-center gap-4">
                    {est10RM > 0 && (
                        <div className="text-sm font-bold text-primary">{est10RM}kg <span className="text-xs font-normal text-muted-foreground">e10RM</span></div>
                    )}
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                            <ChevronDown className={cn("h-4 w-4 ml-2 transition-transform", isOpen && "rotate-180")} />
                        </Button>
                    </CollapsibleTrigger>
                </div>
            </div>
            <CollapsibleContent className="p-4 border border-t-0 rounded-b-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px] px-2">Set</TableHead>
                            <TableHead className="px-2">Reps</TableHead>
                            <TableHead className="px-2">Weight (kg)</TableHead>
                            <TableHead className="w-[50px] px-1"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {setsToRender.map((set, index) => (
                            <TableRow key={set.id}>
                                <TableCell className="font-medium text-center p-2">{index + 1}</TableCell>
                                <TableCell className="p-1"><Input type="number" value={set.reps} onChange={(e) => handleSetChange(index, 'reps', e.target.value)} className="h-9 text-center" /></TableCell>
                                <TableCell className="p-1"><Input type="number" value={set.weight} onChange={(e) => handleSetChange(index, 'weight', e.target.value)} className="h-9 text-center"/></TableCell>
                                <TableCell className="p-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteSet(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="mt-4 flex items-center gap-2">
                    <Button onClick={handleAddSet} className="flex-grow">
                        <Plus className="mr-2 h-4 w-4" /> Add Set
                    </Button>
                    <Button variant="secondary" onClick={handleSaveLog}>
                        Done
                    </Button>
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}

export default function LogPage() {
  const [selectedDay, setSelectedDay] = useState<Day>(getToday());
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [isLogsLoaded, setIsLogsLoaded] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER_PROFILE);

  const [schedule, setSchedule] = useState<WeeklySchedule>(MOCK_SCHEDULE);
  const [routines, setRoutines] = useState<{ [key in Day]?: Exercise[] }>(MOCK_ROUTINES);

  useEffect(() => {
    const savedSchedule = localStorage.getItem('user-schedule');
    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule));
    }
    const savedRoutines = localStorage.getItem('user-routines');
    if (savedRoutines) {
      const parsedRoutines = JSON.parse(savedRoutines);
      const allRoutines: { [key in Day]?: Exercise[] } = {};
      ALL_DAYS.forEach(day => {
          if (parsedRoutines[day]) {
              allRoutines[day] = parsedRoutines[day].map((ex: Exercise) => {
                  const fullExercise = PRELOADED_EXERCISES.find(p => p.id === ex.id);
                  return fullExercise ? { ...ex, ...fullExercise } : ex;
              });
          }
      });
      setRoutines(allRoutines);
    } else {
        setRoutines(MOCK_ROUTINES);
    }
    const savedLogs = localStorage.getItem('user-workout-logs');
    if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
    } else {
        setLogs([]); // Start with no logs
    }
    const savedProfile = localStorage.getItem('user-profile');
    if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
    }
    setIsLogsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLogsLoaded) {
      localStorage.setItem('user-workout-logs', JSON.stringify(logs));
    }
  }, [logs, isLogsLoaded]);

  const workoutForDay = schedule[selectedDay] || ['Rest'];
  const exercisesForDay = routines[selectedDay] || [];
  const isRestDay = workoutForDay.includes('Rest') || exercisesForDay.length === 0;

  const todayDate = new Date().toISOString().split('T')[0];
  const logForDay = logs.find(log => log.day === selectedDay && log.date === todayDate);

  const totalWorkout10RM = useMemo(() => {
    if (!logForDay || exercisesForDay.length === 0) return 0;

    const exercise10RMs = exercisesForDay
        .map(exercise => {
            const entry = logForDay.entries.find(e => e.exerciseId === exercise.id);
            if (!entry) return 0;
            return calculateExercise10RM(entry, exercise, userProfile.weight);
        })
        .filter(rm => rm > 0);

    if (exercise10RMs.length === 0) return 0;

    const average10RM = exercise10RMs.reduce((sum, val) => sum + val, 0) / exercise10RMs.length;
    return Math.round(average10RM);
  }, [logForDay, exercisesForDay, userProfile.weight]);


  return (
    <div className="space-y-4">
      <h1 className="text-center text-2xl font-bold">Log Workout</h1>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-around">
            {dayInitials.map(({initial, full}, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(full)}
                className={cn(
                  "flex flex-col items-center gap-1 text-muted-foreground font-semibold pb-1 w-8",
                  selectedDay === full && "text-primary"
                )}
              >
                <span>{initial}</span>
                {selectedDay === full && <div className="h-0.5 w-full bg-blue-500 rounded-full" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle className="text-xl flex items-center justify-between">
                <span>{workoutForDay.join(' & ')}</span>
                {totalWorkout10RM > 0 && (
                    <div className="text-lg font-bold text-primary">{totalWorkout10RM}kg <span className="text-xs font-normal text-muted-foreground">e10RM</span></div>
                )}
              </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isRestDay ? (
                <p className="text-muted-foreground text-center p-8">It's a rest day. Enjoy your recovery!</p>
            ) : (
                exercisesForDay.map(exercise => (
                    <ExerciseLogger 
                        key={exercise.id} 
                        exercise={exercise}
                        selectedDay={selectedDay}
                        logs={logs}
                        setLogs={setLogs}
                        userWeight={userProfile.weight}
                    />
                ))
            )}
          </CardContent>
      </Card>
    </div>
  );
}
