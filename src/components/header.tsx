import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { SidebarTrigger } from './ui/sidebar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useEffect, useState } from 'react';

export function Header() {
  const avatarImage = PlaceHolderImages.find(img => img.id === 'avatar');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const savedProfile = localStorage.getItem('user-profile');
    if (savedProfile) {
      const name = JSON.parse(savedProfile).name;
      if (name) {
        setUserName(name);
      }
    }
    
    // Listen for changes to user-profile in local storage
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'user-profile' && event.newValue) {
            const newName = JSON.parse(event.newValue).name;
            if (newName) {
                setUserName(newName);
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, []);


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:pt-4">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Avatar>
              <AvatarImage src={avatarImage?.imageUrl} alt={userName} data-ai-hint={avatarImage?.imageHint}/>
              <AvatarFallback>{userName ? userName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{userName || 'My Account'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
