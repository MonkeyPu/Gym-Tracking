'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MOCK_SCHEDULE } from '@/lib/data';
import { ALL_DAYS, WeeklySchedule } from '@/lib/types';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [schedule, setSchedule] = useState<WeeklySchedule>(MOCK_SCHEDULE);

  useEffect(() => {
    const savedSchedule = localStorage.getItem('user-schedule');
    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule));
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">
            Weekly Routine
          </CardTitle>
          <CardDescription>
            Select a day to view and edit its exercises.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            {ALL_DAYS.map((day, index) => (
              <Link
                href={`/routine-creator/${day.toLowerCase()}`}
                key={day}
                className="block"
              >
                <div
                  className={`flex items-center justify-between p-4 transition-colors hover:bg-muted/50 ${
                    index < ALL_DAYS.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <p className="font-semibold">{day}</p>
                    <p className="text-sm text-muted-foreground">
                      {schedule[day]?.join(', ') || 'Rest'}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
