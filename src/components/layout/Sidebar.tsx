import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useContentType } from '@/contexts/ContentTypeContext';
import {
  Home,
  Search,
  Download,
  PlusCircle,
  Heart,
  Disc3,
  Film,
  Music,
  X as CloseIcon
} from 'lucide-react';
import React from 'react';

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const location = useLocation();
  const { contentType } = useContentType();

  const musicNavItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: Disc3, label: 'Albums', href: '/albums' },
    { icon: Download, label: 'Download App', href: '/download' },
    { divider: true },
    { icon: PlusCircle, label: 'Create Playlist', href: '/create-playlist' },
    { icon: Heart, label: 'Liked Songs', href: '/liked-songs' },
  ];

  const movieNavItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
  ];

  const navItems = contentType === 'music' ? musicNavItems : movieNavItems;

  // Responsive sidebar: overlay on mobile, static on desktop
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-60 bg-card transition-transform duration-300 md:static md:translate-x-0 md:block',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:opacity-100 md:pointer-events-auto'
        )}
        aria-label="Sidebar"
      >
        {/* Close button for mobile */}
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-full p-2 hover:bg-white/10"
          >
            <CloseIcon className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="space-y-4 py-4">
          {/* Logo */}
          <div className="px-4">
            <div className="flex items-center gap-2 mb-6">
              <Music className="h-8 w-8 text-music-primary" />
              <h2 className="text-2xl font-bold tracking-tight">
                SoundWave
              </h2>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1 px-3">
            {navItems.map((item, index) => 
              item.divider ? (
                <div key={`divider-${index}`} className="my-4 border-t border-white/10" />
              ) : (
                <Button
                  key={item.href}
                  variant={location.pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    location.pathname === item.href && "bg-accent"
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              )
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
