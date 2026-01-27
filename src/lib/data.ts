import type { Exercise, WeeklySchedule, UserProfile, WorkoutLog, Day } from './types';

export const BODYWEIGHT_FACTORS: { [key: string]: number } = {
  'Push-ups': 0.65,
  'Pull-ups': 1.0,
  'Tricep Dips': 0.9,
  'Sit-ups': 0.4,
};

export const PRELOADED_EXERCISES: Exercise[] = [
  // Chest
  { id: 'ex1', name: 'Bench Press', muscleGroup: 'Chest' },
  { id: 'ex2', name: 'Incline Bench Press', muscleGroup: 'Chest' },
  { id: 'ex3', name: 'Dumbbell Flyes', muscleGroup: 'Chest' },
  { id: 'ex4', name: 'Push-ups', muscleGroup: 'Chest', isBodyweight: true },

  // Back
  { id: 'ex5', name: 'Pull-ups', muscleGroup: 'Lats', isBodyweight: true },
  { id: 'ex6', name: 'Deadlift', muscleGroup: 'Lower Back' },
  { id: 'ex7', name: 'Barbell Rows', muscleGroup: 'Lats' },
  { id: 'ex8', name: 'Lat Pulldowns', muscleGroup: 'Lats' },
  { id: 'ex20', name: 'Shrugs', muscleGroup: 'Traps' },

  // Arms
  { id: 'ex9', name: 'Bicep Curls', muscleGroup: 'Biceps' },
  { id: 'ex10', name: 'Tricep Dips', muscleGroup: 'Triceps', isBodyweight: true },
  { id: 'ex11', name: 'Hammer Curls', muscleGroup: 'Biceps' },
  { id: 'ex12', name: 'Tricep Pushdowns', muscleGroup: 'Triceps' },
  { id: 'ex21', name: 'Wrist Curls', muscleGroup: 'Forearms' },

  // Legs
  { id: 'ex13', name: 'Squats', muscleGroup: 'Quads' },
  { id: 'ex14', name: 'Leg Press', muscleGroup: 'Quads' },
  { id: 'ex15', name: 'Lunges', muscleGroup: 'Quads' },
  { id: 'ex16', name: 'Calf Raises', muscleGroup: 'Calves' },
  { id: 'ex22', name: 'Romanian Deadlift', muscleGroup: 'Hamstrings' },
  { id: 'ex23', name: 'Leg Curls', muscleGroup: 'Hamstrings' },

  // Shoulders
  { id: 'ex17', name: 'Overhead Press', muscleGroup: 'Shoulders' },
  { id: 'ex18', name: 'Lateral Raises', muscleGroup: 'Shoulders' },
  { id: 'ex19', name: 'Front Raises', muscleGroup: 'Shoulders' },
  
  // Abs
  { id: 'ex24', name: 'Sit-ups', muscleGroup: 'Abs', isBodyweight: true },
];

export const MOCK_SCHEDULE: WeeklySchedule = {
  Monday: ['Chest'],
  Tuesday: ['Lats', 'Traps'],
  Wednesday: ['Quads', 'Hamstrings'],
  Thursday: ['Shoulders'],
  Friday: ['Biceps', 'Triceps'],
  Saturday: ['Rest'],
  Sunday: ['Rest'],
};

export const MOCK_USER_PROFILE: UserProfile = {
  name: 'Alex Steel',
  weight: 85,
  height: 180,
  age: 28,
};

export const MOCK_WORKOUT_LOGS: WorkoutLog[] = [
    {
      id: 'log1',
      date: '2024-07-01',
      day: 'Monday',
      entries: [
        {
          exerciseId: 'ex1', // Bench Press
          sets: [{ id: 'set1-1', reps: 10, weight: 39 }],
        },
      ],
    },
    {
      id: 'log2',
      date: '2024-07-08',
      day: 'Monday',
      entries: [
        {
          exerciseId: 'ex1', // Bench Press
          sets: [{ id: 'set2-1', reps: 10, weight: 42 }],
        },
      ],
    },
    {
      id: 'log3',
      date: '2024-07-15',
      day: 'Monday',
      entries: [
        {
          exerciseId: 'ex1', // Bench Press
          sets: [{ id: 'set3-1', reps: 10, weight: 45 }],
        },
      ],
    },
    {
      id: 'log4',
      date: '2024-07-22',
      day: 'Monday',
      entries: [
        {
          exerciseId: 'ex1', // Bench Press
          sets: [{ id: 'set4-1', reps: 10, weight: 45 }],
        },
      ],
    },
  ];

export const MUSCLE_GROUPS = [
    'Chest', 
    'Lats', 
    'Traps',
    'Lower Back',
    'Biceps', 
    'Triceps', 
    'Forearms',
    'Quads',
    'Hamstrings',
    'Calves',
    'Shoulders',
    'Abs'
];

export const MOCK_ROUTINES: { [key in Day]?: Exercise[] } = {
  Monday: [PRELOADED_EXERCISES[0], PRELOADED_EXERCISES[1]],
  Tuesday: [PRELOADED_EXERCISES[4], PRELOADED_EXERCISES[6]],
  Wednesday: [PRELOADED_EXERCISES[14]],
  Thursday: [PRELOADED_EXERCISES[20], PRELOADED_EXERCISES[21]],
  Friday: [PRELOADED_EXERCISES[9], PRELOADED_EXERCISES[10]],
};
