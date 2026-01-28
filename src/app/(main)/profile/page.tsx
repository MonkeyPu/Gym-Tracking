'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({ name: '', weight: 0, height: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedProfile = localStorage.getItem('user-profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    setIsLoaded(true);
  }, []);

  const handleSave = () => {
    localStorage.setItem('user-profile', JSON.stringify(profile));
    toast({
        title: "Profile Saved",
        description: "Your profile has been updated.",
    })
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : 0) : value,
    }));
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={profile.name}
              onChange={handleChange}
              placeholder="e.g., Alex"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              value={profile.weight || ''}
              onChange={handleChange}
              placeholder="e.g., 85"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              name="height"
              type="number"
              value={profile.height || ''}
              onChange={handleChange}
              placeholder="e.g., 180"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave}>Save Profile</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
