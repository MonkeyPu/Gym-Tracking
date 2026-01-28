'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MUSCLE_GROUPS, PRELOADED_EXERCISES } from '@/lib/data';
import { type Day, type WeeklySchedule, type Exercise } from '@/lib/types';
import { PlusCircle, Trash2, Search, ArrowLeft, ChevronsUpDown, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Component to edit a day's workout
function EditDayWorkout({ day, schedule, onSave, children }: { day: Day; schedule: string[]; onSave: (newSchedule: string[]) => void; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(schedule.filter(s => s !== 'Rest'));
  const [other, setOther] = useState('');

  useEffect(() => {
    if (isOpen) {
        setSelectedGroups(schedule.filter(s => s !== 'Rest'));
    }
  }, [isOpen, schedule]);

  const handleCheckboxChange = (group: string, checked: boolean | 'indeterminate') => {
    setSelectedGroups(prev => checked ? [...prev, group] : prev.filter(g => g !== group));
  };

  const handleSave = () => {
    let finalSchedule = [...selectedGroups];
    if (other.trim()) {
      finalSchedule.push(other.trim());
    }
    if (finalSchedule.length === 0) {
      finalSchedule = ['Rest'];
    }
    onSave(finalSchedule);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Workout for {day}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {MUSCLE_GROUPS.map(group => (
              <div key={group} className="flex items-center space-x-2">
                <Checkbox
                  id={`${day}-${group}`}
                  checked={selectedGroups.includes(group)}
                  onCheckedChange={(checked) => handleCheckboxChange(group, checked)}
                />
                <Label htmlFor={`${day}-${group}`}>{group}</Label>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${day}-other`}>Other</Label>
            <Input id={`${day}-other`} placeholder="Custom workout..." value={other} onChange={e => setOther(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// Component to add an exercise
function AddExerciseDialog({ onAddExercise }: { onAddExercise: (exercise: Exercise) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customMuscleGroup, setCustomMuscleGroup] = useState('');
  const [muscleGroupPopoverOpen, setMuscleGroupPopoverOpen] = useState(false);
  const [muscleSearch, setMuscleSearch] = useState('');

  const filteredExercises = PRELOADED_EXERCISES.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredMuscleGroups = MUSCLE_GROUPS.filter(group => group.toLowerCase().includes(muscleSearch.toLowerCase()));

  const handleAddPreloaded = (exercise: Exercise) => {
    onAddExercise(exercise);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAddCustom = () => {
    if (customExerciseName.trim() && customMuscleGroup) {
      const newExercise: Exercise = {
        id: `custom-${Date.now()}`,
        name: customExerciseName.trim(),
        muscleGroup: customMuscleGroup
      };
      onAddExercise(newExercise);
      setCustomExerciseName('');
      setCustomMuscleGroup('');
      setIsOpen(false);
    } else {
        console.error("Missing Information: Please enter a name and select a muscle group.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Exercise
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add an Exercise</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search exercises..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <ScrollArea className="h-[200px] border rounded-md">
                <div className="p-2">
                {filteredExercises.length > 0 ? (
                    filteredExercises.map(ex => (
                    <Button key={ex.id} variant="ghost" className="w-full justify-start" onClick={() => handleAddPreloaded(ex)}>
                        {ex.name}
                    </Button>
                    ))
                ) : (
                    <p className="text-center text-sm text-muted-foreground p-4">No exercises found.</p>
                )}
                </div>
            </ScrollArea>
            <Separator />
            <div className="space-y-4">
                <Label>Or create a custom exercise</Label>
                <div className="space-y-2">
                    <Input placeholder="e.g., Cable Kickbacks" value={customExerciseName} onChange={e => setCustomExerciseName(e.target.value)} />
                    <Collapsible open={muscleGroupPopoverOpen} onOpenChange={setMuscleGroupPopoverOpen}>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={muscleGroupPopoverOpen}
                                className="w-full justify-between"
                            >
                                {customMuscleGroup
                                    ? customMuscleGroup
                                    : "Select a muscle group..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-1">
                             <div className="p-0 border rounded-md">
                                <div className="p-2">
                                <Input 
                                    placeholder="Search muscle groups..." 
                                    value={muscleSearch}
                                    onChange={(e) => setMuscleSearch(e.target.value)}
                                    className="h-9"
                                />
                                </div>
                                <ScrollArea className="h-[150px]">
                                    <div className="p-2 pt-0">
                                    {filteredMuscleGroups.length > 0 ? (
                                    filteredMuscleGroups.map(group => (
                                        <Button
                                            key={group}
                                            variant="ghost"
                                            className="w-full justify-start"
                                            onClick={() => {
                                                setCustomMuscleGroup(group);
                                                setMuscleGroupPopoverOpen(false);
                                                setMuscleSearch('');
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    customMuscleGroup === group ? "opacity-100" : "opacity-0"
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
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleAddCustom} disabled={!customExerciseName.trim() || !customMuscleGroup}>Add</Button>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// The main page component
export default function DayRoutinePage({ params }: { params: { day: string } }) {
  const day = params.day.charAt(0).toUpperCase() + params.day.slice(1) as Day;
  
  const [schedule, setSchedule] = useState<WeeklySchedule>({});
  const [routine, setRoutine] = useState<Exercise[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedSchedule = localStorage.getItem('user-schedule');
    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule));
    }
    
    const savedRoutines = localStorage.getItem('user-routines');
    if (savedRoutines) {
        const parsedRoutines = JSON.parse(savedRoutines);
        setRoutine(parsedRoutines[day] || []);
    }
    setIsLoaded(true);
  }, [day]);

  useEffect(() => {
    if (isLoaded) {
        const savedRoutines = localStorage.getItem('user-routines');
        const allRoutines = savedRoutines ? JSON.parse(savedRoutines) : {};
        allRoutines[day] = routine;
        localStorage.setItem('user-routines', JSON.stringify(allRoutines));
    }
  }, [routine, day, isLoaded]);

  useEffect(() => {
    if(isLoaded){
        localStorage.setItem('user-schedule', JSON.stringify(schedule));
    }
  }, [schedule, isLoaded]);

  
  const handleScheduleSave = (newSchedule: string[]) => {
    setSchedule(prev => ({ ...prev, [day]: newSchedule }));
  };

  const handleAddExercise = (exercise: Exercise) => {
    if (!routine.some(ex => ex.id === exercise.id)) {
      setRoutine(prev => [...prev, exercise]);
    }
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setRoutine(prev => prev.filter(ex => ex.id !== exerciseId));
  };
  
  const exercisePlaceholderImage = PlaceHolderImages.find(img => img.id === 'dumbbell-curl');
  
  if (!day) {
    return <div>Day not found</div>;
  }
  
  const daySchedule = schedule[day] || ['Rest'];

  return (
    <div className="space-y-4">
       <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard"><ArrowLeft /></Link>
        </Button>
        <h1 className="text-lg font-bold">{day}'s Routine</h1>
      </div>
      
      <Card>
        <CardHeader>
            <EditDayWorkout day={day} schedule={daySchedule} onSave={handleScheduleSave}>
                <button className="w-full text-left">
                    <CardTitle className="cursor-pointer hover:text-primary transition-colors text-xl">{daySchedule.join(' / ')}</CardTitle>
                    <CardDescription>Click to edit muscle groups</CardDescription>
                </button>
            </EditDayWorkout>
        </CardHeader>
        <CardContent className="space-y-4">
            {routine.length > 0 ? (
                routine.map(ex => (
                    <div key={ex.id} className="flex items-center gap-4 border p-2 rounded-lg">
                        <Image 
                            src={exercisePlaceholderImage?.imageUrl || "https://picsum.photos/seed/exercise/200/200"} 
                            alt={ex.name}
                            width={64}
                            height={64}
                            className="rounded-md bg-muted aspect-square object-cover"
                            data-ai-hint={exercisePlaceholderImage?.imageHint}
                        />
                        <div className="flex-grow">
                            <p className="font-semibold">{ex.name}</p>
                            <p className="text-sm text-muted-foreground">{ex.muscleGroup}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteExercise(ex.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))
            ) : (
                <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                    <p className="mb-2">No exercises added for {day}.</p>
                    <AddExerciseDialog onAddExercise={handleAddExercise} />
                </div>
            )}
        </CardContent>
        {routine.length > 0 && (
             <CardFooter>
                <AddExerciseDialog onAddExercise={handleAddExercise} />
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
