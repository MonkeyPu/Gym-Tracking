'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PRELOADED_EXERCISES } from '@/lib/data';
import { type Exercise, type PersonalRecord } from '@/lib/types';
import { PlusCircle, Trash2, Trophy, Medal, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronsUpDown, Check } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from '@/components/ui/separator';


// Calculate e1RM using the Epley formula
const calculateE1RM = (weight: number, reps: number): number => {
    if (reps <= 0) return 0;
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
};

function AddRecordDialog({ onAddRecord }: { onAddRecord: (record: Omit<PersonalRecord, 'id' | 'date'>) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const [exercisePopoverOpen, setExercisePopoverOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');

  const filteredExercises = PRELOADED_EXERCISES.filter(ex =>
    ex.name.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  const handleSave = () => {
    let exerciseId: string;
    let exerciseName: string;

    if (customExerciseName.trim()) {
      exerciseName = customExerciseName.trim();
      exerciseId = `custom-${Date.now()}`;
    } else if (selectedExercise) {
      exerciseName = selectedExercise.name;
      exerciseId = selectedExercise.id;
    } else {
      console.error('Missing Information: Please select an exercise or enter a custom name.');
      return;
    }

    if (!weight || !reps) {
      console.error('Missing Information: Please enter weight and reps.');
      return;
    }

    const newRecord = {
      exerciseId,
      exerciseName,
      weight: Number(weight),
      reps: Number(reps),
      e1RM: calculateE1RM(Number(weight), Number(reps)),
    };

    onAddRecord(newRecord);

    // Reset form and close dialog
    setSelectedExercise(null);
    setCustomExerciseName('');
    setWeight('');
    setReps('');
    setExerciseSearch('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Record
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Personal Record</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Exercise</Label>
            <Collapsible open={exercisePopoverOpen} onOpenChange={setExercisePopoverOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={exercisePopoverOpen}
                  className="w-full justify-between"
                >
                  {selectedExercise
                    ? selectedExercise.name
                    : 'Select an exercise...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1">
                <div className="p-0 border rounded-md">
                  <div className="p-2">
                    <Input
                      placeholder="Search exercises..."
                      value={exerciseSearch}
                      onChange={(e) => setExerciseSearch(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <ScrollArea className="h-[150px]">
                    <div className="p-2 pt-0">
                      {filteredExercises.length > 0 ? (
                        filteredExercises.map((ex) => (
                          <Button
                            key={ex.id}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              setSelectedExercise(ex);
                              setCustomExerciseName('');
                              setExercisePopoverOpen(false);
                              setExerciseSearch('');
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedExercise?.id === ex.id
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {ex.name}
                          </Button>
                        ))
                      ) : (
                        <p className="text-center text-sm text-muted-foreground p-4">
                          No exercise found.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <Separator/>
           <div className="space-y-2">
            <Label>Or create a custom exercise</Label>
            <Input 
              placeholder="e.g. Cable Crunches"
              value={customExerciseName}
              onChange={(e) => {
                setCustomExerciseName(e.target.value);
                if (e.target.value) {
                  setSelectedExercise(null);
                }
              }}
            />
          </div>
          <Separator/>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="e.g., 100"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reps">Reps</Label>
            <Input
              id="reps"
              type="number"
              placeholder="e.g., 5"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Record</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditRecordDialog({ record, onSave, children }: { record: PersonalRecord, onSave: (record: PersonalRecord) => void, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [weight, setWeight] = useState(String(record.weight));
  const [reps, setReps] = useState(String(record.reps));

  useEffect(() => {
    if (isOpen) {
      setWeight(String(record.weight));
      setReps(String(record.reps));
    }
  }, [isOpen, record]);

  const handleSave = () => {
    if (!weight || !reps) {
      console.error('Missing Information: Please enter weight and reps.');
      return;
    }

    const updatedRecord: PersonalRecord = {
      ...record,
      weight: Number(weight),
      reps: Number(reps),
      e1RM: calculateE1RM(Number(weight), Number(reps)),
      date: new Date().toISOString(), // Update date on edit
    };
    
    onSave(updatedRecord);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Record: {record.exerciseName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="weight-edit">Weight (kg)</Label>
            <Input id="weight-edit" type="number" value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reps-edit">Reps</Label>
            <Input id="reps-edit" type="number" value={reps} onChange={e => setReps(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function RecordsPage() {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedRecords = localStorage.getItem('user-personal-records');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('user-personal-records', JSON.stringify(records));
    }
  }, [records, isLoaded]);

  const handleAddRecord = (newRecordData: Omit<PersonalRecord, 'id' | 'date'>) => {
    const newRecord: PersonalRecord = {
      ...newRecordData,
      id: `pr-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setRecords(prev => [...prev, newRecord].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleEditRecord = (updatedData: PersonalRecord) => {
    setRecords(prev => {
        const newRecords = prev.map(r => r.id === updatedData.id ? updatedData : r);
        return newRecords.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }

  const handleDeleteRecord = (recordId: string) => {
    setRecords(prev => prev.filter(r => r.id !== recordId));
  }

  const groupedRecords = records.reduce((acc, record) => {
    if (!acc[record.exerciseName] || record.e1RM > acc[record.exerciseName].e1RM) {
        acc[record.exerciseName] = record;
    }
    return acc;
  }, {} as {[key: string]: PersonalRecord});

  const bestRecords = Object.values(groupedRecords).sort((a, b) => b.e1RM - a.e1RM);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline flex items-center gap-2"><Trophy className="text-primary"/> Personal Records</h1>
        <AddRecordDialog onAddRecord={handleAddRecord} />
      </div>

      {records.length === 0 && isLoaded ? (
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <Medal className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-semibold">No records yet!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Click "Add Record" to save your first personal best.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
            <CardHeader>
                <CardTitle>Your Best Lifts</CardTitle>
                <CardDescription>Your all-time best estimated 1-rep max for each exercise.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {bestRecords.map(record => (
                     <div key={record.id} className="flex items-center gap-4 border p-3 rounded-lg bg-muted/30">
                        <div className="flex-grow">
                            <p className="font-semibold">{record.exerciseName}</p>
                            <p className="text-sm text-muted-foreground">
                                {record.weight}kg for {record.reps} reps on {new Date(record.date).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-primary text-lg">{record.e1RM}kg</p>
                             <p className="text-xs text-muted-foreground">e1RM</p>
                        </div>
                        <div className="flex items-center">
                            <EditRecordDialog record={record} onSave={handleEditRecord}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </EditRecordDialog>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete this record. This action cannot be undone.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteRecord(record.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                     </div>
                ))}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
