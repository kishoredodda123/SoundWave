
import React from 'react';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="space-y-2">
        <Button 
          onClick={() => navigate('/login')} 
          className="w-full bg-music-primary hover:bg-music-primary/90"
        >
          Sign In
        </Button>
        <Button 
          onClick={() => navigate('/signup')} 
          variant="outline" 
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Sign Up
        </Button>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = () => {
    const name = user.user_metadata?.full_name || user.email;
    return name?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full p-2 h-auto justify-start">
          <div className="flex items-center space-x-3 w-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-music-primary text-white">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-white truncate">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user.user_metadata?.username || 'User'}
              </p>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-music-secondary border-gray-700">
        <DropdownMenuItem className="text-white hover:bg-gray-700">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="text-red-400 hover:bg-gray-700 hover:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
