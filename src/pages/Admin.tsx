
import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Music, Album as AlbumIcon, Edit2, Save, X } from "lucide-react";
import MainLayout from '@/components/layout/MainLayout';
import { musicService, Album } from '@/services/musicService';

const Admin = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [albumData, setAlbumData] = useState({
    title: '',
    cover: '',
    numberOfSongs: 1,
    releaseDate: new Date().toISOString().split('T')[0]
  });
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null);
  const [trackData, setTrackData] = useState({
    title: '',
    artist: '',
    audioUrl: ''
  });
  const [trackIndex, setTrackIndex] = useState(0);
  const [editingAlbum, setEditingAlbum] = useState<string | null>(null);
  const [editingTrack, setEditingTrack] = useState<string | null>(null);
  const [editAlbumData, setEditAlbumData] = useState({ title: '', cover: '' });
  const [editTrackData, setEditTrackData] = useState({ title: '', artist: '', audioUrl: '' });

  const loadAlbums = () => {
    setAlbums(musicService.getAlbums());
  };

  // Load albums when component mounts
  useState(() => {
    loadAlbums();
  });

  const handleCreateAlbum = () => {
    if (!albumData.title) {
      toast({
        title: "Error",
        description: "Please fill in album title.",
        variant: "destructive",
      });
      return;
    }

    const newAlbum = musicService.createAlbum({
      title: albumData.title,
      artist: 'Various Artists',
      cover: albumData.cover || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=300&h=300',
      releaseDate: albumData.releaseDate,
      trackCount: 0,
      tracks: []
    });

    setCurrentAlbumId(newAlbum.id);
    setTrackIndex(0);
    setIsCreatingAlbum(false);
    loadAlbums();
    
    toast({
      title: "Album Created",
      description: `Album "${albumData.title}" created successfully. Now add songs to it.`,
    });

    setAlbumData({
      title: '',
      cover: '',
      numberOfSongs: 1,
      releaseDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleAddTrack = async () => {
    if (!currentAlbumId || !trackData.title || !trackData.artist || !trackData.audioUrl) {
      toast({
        title: "Error",
        description: "Please fill in all track details.",
        variant: "destructive",
      });
      return;
    }

    const currentAlbum = musicService.getAlbums().find(a => a.id === currentAlbumId);
    
    const track = await musicService.addTrackToAlbum(currentAlbumId, {
      title: trackData.title,
      artist: trackData.artist,
      album: currentAlbum?.title || '',
      cover: currentAlbum?.cover || '',
      audioUrl: trackData.audioUrl,
      genre: 'Album Track'
    });

    if (track) {
      setTrackIndex(prev => prev + 1);
      setTrackData({
        title: '',
        artist: '',
        audioUrl: ''
      });

      toast({
        title: "Track Added",
        description: `Track "${track.title}" added to album successfully.`,
      });

      loadAlbums();

      const updatedAlbum = musicService.getAlbums().find(a => a.id === currentAlbumId);
      if (updatedAlbum && trackIndex + 1 >= albumData.numberOfSongs) {
        toast({
          title: "Album Complete",
          description: `Album "${updatedAlbum.title}" is complete with ${updatedAlbum.trackCount} tracks.`,
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

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album.id);
    setEditAlbumData({ title: album.title, cover: album.cover });
  };

  const handleSaveAlbum = () => {
    if (!editingAlbum || !editAlbumData.title) return;
    
    musicService.updateAlbum(editingAlbum, editAlbumData);
    loadAlbums();
    setEditingAlbum(null);
    
    toast({
      title: "Album Updated",
      description: "Album details updated successfully.",
    });
  };

  const handleEditTrack = (track: any) => {
    setEditingTrack(track.id);
    setEditTrackData({ 
      title: track.title, 
      artist: track.artist, 
      audioUrl: track.audioUrl 
    });
  };

  const handleSaveTrack = () => {
    if (!editingTrack || !editTrackData.title || !editTrackData.artist) return;
    
    musicService.updateTrack(editingTrack, editTrackData);
    loadAlbums();
    setEditingTrack(null);
    
    toast({
      title: "Track Updated",
      description: "Track details updated successfully.",
    });
  };

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
                    <Label htmlFor="albumCover">Cover URL</Label>
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
            <CardDescription>Manage your created albums and tracks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {albums.length > 0 ? (
                albums.map((album) => (
                  <div key={album.id} className="border rounded-lg p-4 bg-music-cardBg">
                    <div className="flex items-start gap-4">
                      <img 
                        src={album.cover} 
                        alt={album.title}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      
                      <div className="flex-1">
                        {editingAlbum === album.id ? (
                          <div className="space-y-3">
                            <Input
                              value={editAlbumData.title}
                              onChange={(e) => setEditAlbumData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Album title"
                            />
                            <Input
                              value={editAlbumData.cover}
                              onChange={(e) => setEditAlbumData(prev => ({ ...prev, cover: e.target.value }))}
                              placeholder="Cover URL"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSaveAlbum}>
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingAlbum(null)}>
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-white text-lg">{album.title}</h3>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditAlbum(album)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-400 mb-3">{album.trackCount} tracks</p>
                            <Button
                              size="sm"
                              onClick={() => handleAddExtraTrack(album.id)}
                              className="bg-music-primary text-black hover:bg-music-highlight"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Track
                            </Button>
                          </div>
                        )}
                        
                        {/* Tracks List */}
                        {album.tracks.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-medium text-gray-300">Tracks:</h4>
                            {album.tracks.map((track) => (
                              <div key={track.id} className="flex items-center justify-between bg-music-hover p-2 rounded">
                                {editingTrack === track.id ? (
                                  <div className="flex-1 grid grid-cols-3 gap-2">
                                    <Input
                                      value={editTrackData.title}
                                      onChange={(e) => setEditTrackData(prev => ({ ...prev, title: e.target.value }))}
                                      placeholder="Title"
                                      className="text-sm"
                                    />
                                    <Input
                                      value={editTrackData.artist}
                                      onChange={(e) => setEditTrackData(prev => ({ ...prev, artist: e.target.value }))}
                                      placeholder="Artist"
                                      className="text-sm"
                                    />
                                    <div className="flex gap-1">
                                      <Button size="sm" onClick={handleSaveTrack}>
                                        <Save className="h-3 w-3" />
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => setEditingTrack(null)}>
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex-1">
                                      <p className="text-sm text-white">{track.title}</p>
                                      <p className="text-xs text-gray-400">{track.artist}</p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditTrack(track)}
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
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
