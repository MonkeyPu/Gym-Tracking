'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ALL_DAYS, type WeeklySchedule } from '@/lib/types';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Pencil } from 'lucide-react';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<WeeklySchedule>({});

  useEffect(() => {
    const savedSchedule = localStorage.getItem('user-schedule');
    if (savedSchedule) {
        setSchedule(JSON.parse(savedSchedule));
    }
  }, []);

  return (
    <div className="space-y-6">
       <Alert>
        <Pencil className="h-4 w-4" />
        <AlertTitle>Editing has moved!</AlertTitle>
        <AlertDescription>
          You can now build your full routine in the Routine Creator.
          <Button asChild variant="link" className="p-0 h-auto ml-1">
            <Link href="/dashboard">Go to Routine Creator</Link>
          </Button>
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <div>
              <CardTitle className="font-headline text-2xl">Your Weekly Plan</CardTitle>
              <CardDescription>
                This is your current weekly workout split.
              </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ALL_DAYS.map((day) => (
              <div
                key={day}
                className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/30"
              >
                <div className="font-semibold">{day}</div>
                <div className="text-muted-foreground font-medium">
                  {(schedule[day] || ['Rest']).join(' & ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
