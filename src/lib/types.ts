export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const ALL_DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


export type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  isBodyweight?: boolean;
};

export type SetLog = {
  id: string;
  reps: number;
  weight: number;
};

export type WorkoutLogEntry = {
  exerciseId: string;
  sets: SetLog[];
};

export type WorkoutLog = {
  id: string;
  date: string; // ISO string date
  day: Day;
  entries: WorkoutLogEntry[];
};

export type WeeklySchedule = {
  [key in Day]?: string[]; // Muscle group
};

export type UserProfile = {
  name: string;
  weight: number; // in kg
  height: number; // in cm
  age?: number;
};

export type ProgressData = {
  date: string;
  [key: string]: number | string; // Exercise IDs as keys, volume as values
};

export type PersonalRecord = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string; // ISO string date
  e1RM: number;
};
