
import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Music, Album as AlbumIcon } from "lucide-react";
import MainLayout from '@/components/layout/MainLayout';
import { musicService, Album } from '@/services/musicService';

const Admin = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [albumData, setAlbumData] = useState({
    title: '',
    artist: '',
    cover: '',
    numberOfSongs: 1,
    releaseDate: new Date().toISOString().split('T')[0]
  });
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null);
  const [trackData, setTrackData] = useState({
    title: '',
    artist: '',
    audioUrl: '',
    duration: 180
  });
  const [trackIndex, setTrackIndex] = useState(0);

  const handleCreateAlbum = () => {
    if (!albumData.title || !albumData.artist) {
      toast({
        title: "Error",
        description: "Please fill in album title and artist.",
        variant: "destructive",
      });
      return;
    }

    const newAlbum = musicService.createAlbum({
      title: albumData.title,
      artist: albumData.artist,
      cover: albumData.cover || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=300&h=300',
      releaseDate: albumData.releaseDate,
      trackCount: 0,
      tracks: []
    });

    setCurrentAlbumId(newAlbum.id);
    setTrackIndex(0);
    setIsCreatingAlbum(false);
    
    toast({
      title: "Album Created",
      description: `Album "${albumData.title}" created successfully. Now add songs to it.`,
    });

    setAlbumData({
      title: '',
      artist: '',
      cover: '',
      numberOfSongs: 1,
      releaseDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleAddTrack = () => {
    if (!currentAlbumId || !trackData.title || !trackData.artist || !trackData.audioUrl) {
      toast({
        title: "Error",
        description: "Please fill in all track details.",
        variant: "destructive",
      });
      return;
    }

    const track = musicService.addTrackToAlbum(currentAlbumId, {
      title: trackData.title,
      artist: trackData.artist,
      album: albums.find(a => a.id === currentAlbumId)?.title || '',
      duration: trackData.duration,
      cover: albums.find(a => a.id === currentAlbumId)?.cover || '',
      audioUrl: trackData.audioUrl,
      genre: 'Album Track'
    });

    if (track) {
      setTrackIndex(prev => prev + 1);
      setTrackData({
        title: '',
        artist: '',
        audioUrl: '',
        duration: 180
      });

      toast({
        title: "Track Added",
        description: `Track "${track.title}" added to album successfully.`,
      });

      // Refresh albums list
      setAlbums(musicService.getAlbums());

      const currentAlbum = musicService.getAlbums().find(a => a.id === currentAlbumId);
      if (currentAlbum && trackIndex + 1 >= albumData.numberOfSongs) {
        toast({
          title: "Album Complete",
          description: `Album "${currentAlbum.title}" is complete with ${currentAlbum.trackCount} tracks.`,
        });
        setCurrentAlbumId(null);
        setTrackIndex(0);
      }
    }
  };

  const handleAddExtraTrack = (albumId: string) => {
    setCurrentAlbumId(albumId);
    setTrackIndex(0);
  };

  // Load albums when component mounts
  useState(() => {
    setAlbums(musicService.getAlbums());
  });

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Create Album Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlbumIcon className="h-5 w-5 mr-2" />
                Create Album
              </CardTitle>
              <CardDescription>Create a new album and add songs to it.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isCreatingAlbum ? (
                <Button 
                  onClick={() => setIsCreatingAlbum(true)}
                  className="bg-music-primary text-black hover:bg-music-highlight"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Album
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="albumTitle">Album Title</Label>
                    <Input
                      id="albumTitle"
                      value={albumData.title}
                      onChange={(e) => setAlbumData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter album title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="albumArtist">Artist</Label>
                    <Input
                      id="albumArtist"
                      value={albumData.artist}
                      onChange={(e) => setAlbumData(prev => ({ ...prev, artist: e.target.value }))}
                      placeholder="Enter artist name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="albumCover">Cover URL (optional)</Label>
                    <Input
                      id="albumCover"
                      value={albumData.cover}
                      onChange={(e) => setAlbumData(prev => ({ ...prev, cover: e.target.value }))}
                      placeholder="Enter cover image URL"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="numberOfSongs">Number of Songs</Label>
                    <Input
                      id="numberOfSongs"
                      type="number"
                      min="1"
                      value={albumData.numberOfSongs}
                      onChange={(e) => setAlbumData(prev => ({ ...prev, numberOfSongs: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCreateAlbum}
                      className="bg-music-primary text-black hover:bg-music-highlight"
                    >
                      Create Album
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setIsCreatingAlbum(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Add Track Card */}
          {currentAlbumId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Music className="h-5 w-5 mr-2" />
                  Add Track {trackIndex + 1}
                </CardTitle>
                <CardDescription>
                  Adding track to: {albums.find(a => a.id === currentAlbumId)?.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="trackTitle">Song Title</Label>
                  <Input
                    id="trackTitle"
                    value={trackData.title}
                    onChange={(e) => setTrackData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter song title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="trackArtist">Artist</Label>
                  <Input
                    id="trackArtist"
                    value={trackData.artist}
                    onChange={(e) => setTrackData(prev => ({ ...prev, artist: e.target.value }))}
                    placeholder="Enter artist name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="trackUrl">Song URL</Label>
                  <Input
                    id="trackUrl"
                    value={trackData.audioUrl}
                    onChange={(e) => setTrackData(prev => ({ ...prev, audioUrl: e.target.value }))}
                    placeholder="Enter song URL (MP3, etc.)"
                  />
                </div>
                
                <div>
                  <Label htmlFor="trackDuration">Duration (seconds)</Label>
                  <Input
                    id="trackDuration"
                    type="number"
                    value={trackData.duration}
                    onChange={(e) => setTrackData(prev => ({ ...prev, duration: parseInt(e.target.value) || 180 }))}
                  />
                </div>
                
                <Button 
                  onClick={handleAddTrack}
                  className="bg-music-primary text-black hover:bg-music-highlight w-full"
                >
                  Add Track
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Albums List */}
        <Card>
          <CardHeader>
            <CardTitle>Created Albums</CardTitle>
            <CardDescription>Manage your created albums and add extra tracks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {albums.length > 0 ? (
                albums.map((album) => (
                  <div key={album.id} className="border rounded-lg p-4 bg-music-cardBg">
                    <img 
                      src={album.cover} 
                      alt={album.title}
                      className="w-full aspect-square object-cover rounded-md mb-3"
                    />
                    <h3 className="font-medium text-white mb-1">{album.title}</h3>
                    <p className="text-sm text-gray-400 mb-2">{album.artist}</p>
                    <p className="text-xs text-gray-500 mb-3">{album.trackCount} tracks</p>
                    <Button
                      size="sm"
                      onClick={() => handleAddExtraTrack(album.id)}
                      className="bg-music-primary text-black hover:bg-music-highlight w-full"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Track
                    </Button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400">No albums created yet. Create your first album!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Admin;
