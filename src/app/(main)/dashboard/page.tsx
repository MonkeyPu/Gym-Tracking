'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Activity,
  ArrowUp,
  Weight,
  Dumbbell,
  Flame,
  PersonStanding,
} from 'lucide-react';
import { MOCK_SCHEDULE, MOCK_WORKOUT_LOGS } from '@/lib/data';
import { ALL_DAYS, type Day, type WeeklySchedule } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

const getIconForMuscleGroup = (muscleGroup: string) => {
  switch (muscleGroup.toLowerCase()) {
    case 'chest':
      return <Dumbbell className="w-6 h-6 text-accent" />;
    case 'back':
    case 'lats':
    case 'traps':
    case 'lower back':
      return <Weight className="w-6 h-6 text-accent" />;
    case 'legs':
    case 'quads':
    case 'hamstrings':
    case 'calves':
      return <PersonStanding className="w-6 h-6 text-accent" />;
    case 'arms':
    case 'biceps':
    case 'triceps':
    case 'forearms':
      return <Flame className="w-6 h-6 text-accent" />;
    case 'shoulders':
      return <ArrowUp className="w-6 h-6 text-accent" />;
    default:
      return <Activity className="w-6 h-6 text-muted-foreground" />;
  }
};

const TodayWorkoutCard = () => {
    const [schedule, setSchedule] = useState<WeeklySchedule>(MOCK_SCHEDULE);
    useEffect(() => {
        const savedSchedule = localStorage.getItem('user-schedule');
        if (savedSchedule) {
            setSchedule(JSON.parse(savedSchedule));
        }
    }, []);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as Day;
    const muscleGroups = schedule[today] || ['Rest'];
    const isRestDay = muscleGroups.includes('Rest');
    const muscleGroupDisplay = muscleGroups.join(' & ');
  
    return (
      <Card className="bg-primary/5 border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline">Today's Focus: {muscleGroupDisplay}</CardTitle>
          <CardDescription>
            {isRestDay ? "Time to recover and grow stronger!" : `Get ready to train ${muscleGroupDisplay}. Let's do it!`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {getIconForMuscleGroup(muscleGroups[0])}
            {!isRestDay && (
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href={`/log`}>Start Workout</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
};

const WeeklyScheduleCard = () => {
    const [schedule, setSchedule] = useState<WeeklySchedule>(MOCK_SCHEDULE);
    useEffect(() => {
        const savedSchedule = localStorage.getItem('user-schedule');
        if (savedSchedule) {
            setSchedule(JSON.parse(savedSchedule));
        }
    }, []);

    return (
    <Card>
      <CardHeader>
        <CardTitle>Your Week</CardTitle>
        <CardDescription>Your weekly workout split. Tap a day to view details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ALL_DAYS.map((day) => {
            const muscleGroups = schedule[day] || ['Rest'];
            const muscleGroupDisplay = muscleGroups.join(' & ');
            const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
            return (
                <Link href="/routine-creator" key={day} className="block">
                <div className={`flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-muted/50 ${isToday ? 'bg-muted' : ''}`}>
                    <div className="flex items-center gap-4">
                    {getIconForMuscleGroup(muscleGroups[0])}
                    <div>
                        <p className="font-semibold">{day}</p>
                        <p className="text-sm text-muted-foreground">{muscleGroupDisplay}</p>
                    </div>
                    </div>
                    {isToday && <Badge variant="default" className="bg-accent">Today</Badge>}
                </div>
                </Link>
            )
        })}
      </CardContent>
    </Card>
    )
};

const RecentActivityCard = () => {
    const [logs, setLogs] = useState(MOCK_WORKOUT_LOGS);

    useEffect(() => {
        // Always start with the mock data to ensure the latest changes are shown.
        // In a real app, you'd have a more robust data seeding or migration strategy.
        setLogs(MOCK_WORKOUT_LOGS);
    }, []);

    const lastWorkout = logs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your last logged workout.</CardDescription>
            </CardHeader>
            <CardContent>
                {lastWorkout ? (
                    <div>
                        <p className="font-semibold">{lastWorkout.day} - {new Date(lastWorkout.date).toLocaleDateString()}</p>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {lastWorkout.entries.map(entry => (
                                <li key={entry.exerciseId}>- {entry.sets.length} sets of exercise {entry.exerciseId}</li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-muted-foreground">No recent activity logged.</p>
                )}
            </CardContent>
        </Card>
    )
}

export default function DashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-3">
            <TodayWorkoutCard />
        </div>
        <div className="lg:col-span-2">
            <WeeklyScheduleCard />
        </div>
        <div>
            <RecentActivityCard />
        </div>
    </div>
  );
}
