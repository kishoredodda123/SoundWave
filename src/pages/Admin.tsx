import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Music, Album as AlbumIcon, Edit2, Save, X, Loader2, Smartphone } from "lucide-react";
import MainLayout from '@/components/layout/MainLayout';
import { musicService, Album } from '@/services/musicService';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'albums' | 'applink'>('albums');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [downloadLink, setDownloadLink] = useState('');

  const loadAlbums = async () => {
    try {
      const fetchedAlbums = await musicService.getAlbums();
      setAlbums(fetchedAlbums);
    } catch (error) {
      console.error('Error loading albums:', error);
      toast({
        title: "Error",
        description: "Failed to load albums. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('androidDownloadLink');
    if (saved) setDownloadLink(saved);
  }, []);

  const handleDownloadLinkSave = () => {
    localStorage.setItem('androidDownloadLink', downloadLink);
    toast({
      title: "Saved!",
      description: "Android app download link updated.",
    });
  };

  const handleCreateAlbum = async () => {
    if (!albumData.title) {
      toast({
        title: "Error",
        description: "Please fill in album title.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (albumData.cover) {
        try {
          new URL(albumData.cover);
        } catch (e) {
          toast({
            title: "Error",
            description: "Please enter a valid cover image URL.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      const newAlbum = await musicService.createAlbum({
        title: albumData.title.trim(),
        artist: 'Various Artists',
        cover: albumData.cover?.trim() || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=300&h=300',
        releaseDate: albumData.releaseDate,
        trackCount: 0,
        tracks: []
      });

      if (newAlbum) {
        setCurrentAlbumId(newAlbum.id);
        setTrackIndex(0);
        setIsCreatingAlbum(false);
        await loadAlbums();
        
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
      } else {
        throw new Error('Failed to create album - server returned null');
      }
    } catch (error) {
      console.error('Error creating album:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create album. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

    setIsLoading(true);
    try {
      const currentAlbum = albums.find(a => a.id === currentAlbumId);
      if (!currentAlbum) {
        throw new Error('Album not found');
      }
      
      const track = await musicService.addTrackToAlbum(currentAlbumId, {
        title: trackData.title,
        artist: trackData.artist,
        album: currentAlbum.title,
        cover: currentAlbum.cover,
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

        await loadAlbums();

        if (trackIndex + 1 >= albumData.numberOfSongs) {
          toast({
            title: "Album Complete",
            description: `Album "${currentAlbum.title}" is complete with ${trackIndex + 1} tracks.`,
          });
          setCurrentAlbumId(null);
          setTrackIndex(0);
        }
      } else {
        throw new Error('Failed to add track');
      }
    } catch (error) {
      console.error('Error adding track:', error);
      toast({
        title: "Error",
        description: "Failed to add track. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  const handleSaveAlbum = async () => {
    if (!editingAlbum || !editAlbumData.title) {
      toast({
        title: "Error",
        description: "Please fill in at least the album title.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await musicService.updateAlbum(editingAlbum, editAlbumData);
      
      if (success) {
        await loadAlbums();
        setEditingAlbum(null);
        setEditAlbumData({ title: '', cover: '' });
        
        toast({
          title: "Album Updated",
          description: "Album details updated successfully.",
        });
      } else {
        throw new Error('Failed to update album');
      }
    } catch (error) {
      console.error('Error updating album:', error);
      toast({
        title: "Error",
        description: "Failed to update album. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTrack = (track: any) => {
    setEditingTrack(track.id);
    setEditTrackData({ 
      title: track.title, 
      artist: track.artist, 
      audioUrl: track.audioUrl 
    });
  };

  const handleSaveTrack = async () => {
    if (!editingTrack || !editTrackData.title || !editTrackData.artist) {
      toast({
        title: "Error",
        description: "Please fill in at least the track title and artist.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await musicService.updateTrack(editingTrack, editTrackData);
      
      if (success) {
        await loadAlbums();
        setEditingTrack(null);
        setEditTrackData({ title: '', artist: '', audioUrl: '' });
        
        toast({
          title: "Track Updated",
          description: "Track details updated successfully.",
        });
      } else {
        throw new Error('Failed to update track');
      }
    } catch (error) {
      console.error('Error updating track:', error);
      toast({
        title: "Error",
        description: "Failed to update track. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Admin Dashboard</h1>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab('albums')}
            className={`${
              activeTab === 'albums'
                ? 'bg-music-primary text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            <AlbumIcon className="h-4 w-4 mr-2" />
            Manage Albums
          </Button>
          <Button
            onClick={() => setActiveTab('applink')}
            className={`${
              activeTab === 'applink'
                ? 'bg-music-primary text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            App Download Link
          </Button>
        </div>

        {activeTab === 'albums' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Create Album Card */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <AlbumIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Create Album
                  </CardTitle>
                  <CardDescription className="text-sm">Create a new album and add songs to it.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {!isCreatingAlbum ? (
                    <Button 
                      onClick={() => setIsCreatingAlbum(true)}
                      className="bg-music-primary text-black hover:bg-music-highlight w-full sm:w-auto"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Album
                    </Button>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <Label htmlFor="albumTitle" className="text-sm">Album Title</Label>
                        <Input
                          id="albumTitle"
                          value={albumData.title}
                          onChange={(e) => setAlbumData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter album title"
                          className="text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="albumCover" className="text-sm">Cover URL</Label>
                        <Input
                          id="albumCover"
                          value={albumData.cover}
                          onChange={(e) => setAlbumData(prev => ({ ...prev, cover: e.target.value }))}
                          placeholder="Enter cover image URL"
                          className="text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="numberOfSongs" className="text-sm">Number of Songs</Label>
                        <Input
                          id="numberOfSongs"
                          type="number"
                          min="1"
                          value={albumData.numberOfSongs}
                          onChange={(e) => setAlbumData(prev => ({ ...prev, numberOfSongs: parseInt(e.target.value) || 1 }))}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          onClick={handleCreateAlbum}
                          className="bg-music-primary text-black hover:bg-music-highlight"
                          size="sm"
                        >
                          Create Album
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setIsCreatingAlbum(false)}
                          size="sm"
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
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                      <Music className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Add Track {trackIndex + 1}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Adding track to: {albums.find(a => a.id === currentAlbumId)?.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div>
                      <Label htmlFor="trackTitle" className="text-sm">Song Title</Label>
                      <Input
                        id="trackTitle"
                        value={trackData.title}
                        onChange={(e) => setTrackData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter song title"
                        className="text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="trackArtist" className="text-sm">Artist</Label>
                      <Input
                        id="trackArtist"
                        value={trackData.artist}
                        onChange={(e) => setTrackData(prev => ({ ...prev, artist: e.target.value }))}
                        placeholder="Enter artist name"
                        className="text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="trackUrl" className="text-sm">Song URL</Label>
                      <Input
                        id="trackUrl"
                        value={trackData.audioUrl}
                        onChange={(e) => setTrackData(prev => ({ ...prev, audioUrl: e.target.value }))}
                        placeholder="Enter song URL (MP3, etc.)"
                        className="text-sm"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleAddTrack}
                      className="bg-music-primary text-black hover:bg-music-highlight w-full"
                      size="sm"
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
                <CardTitle className="text-lg sm:text-xl">Created Albums</CardTitle>
                <CardDescription className="text-sm">Manage your created albums and tracks.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-music-primary" />
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {albums.length > 0 ? (
                      albums.map((album) => (
                        <div key={album.id} className="border rounded-lg p-3 sm:p-4 bg-music-cardBg">
                          <div className="flex items-start gap-3 sm:gap-4">
                            <img 
                              src={album.cover} 
                              alt={album.title}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md flex-shrink-0"
                            />
                            
                            <div className="flex-1 min-w-0">
                              {editingAlbum === album.id ? (
                                <div className="space-y-3">
                                  <div className="space-y-3">
                                    <Input
                                      value={editAlbumData.title}
                                      onChange={(e) => setEditAlbumData(prev => ({ ...prev, title: e.target.value }))}
                                      placeholder="Album title"
                                      className="text-sm"
                                    />
                                    <Input
                                      value={editAlbumData.cover}
                                      onChange={(e) => setEditAlbumData(prev => ({ ...prev, cover: e.target.value }))}
                                      placeholder="Cover URL"
                                      className="text-sm"
                                    />
                                  </div>
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <Button size="sm" onClick={handleSaveAlbum} className="bg-music-primary text-black hover:bg-music-highlight">
                                      <Save className="h-3 w-3 mr-1" />
                                      Save
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditingAlbum(null)}>
                                      <X className="h-3 w-3 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                    <h3 className="font-medium text-white text-base sm:text-lg truncate">{album.title}</h3>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEditAlbum(album)}
                                        className="text-xs"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleAddExtraTrack(album.id)}
                                        className="bg-music-primary text-black hover:bg-music-highlight text-xs"
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add Track
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-xs sm:text-sm text-gray-400 mb-1">{album.trackCount} tracks</p>
                                  <p className="text-xs text-gray-500 truncate mb-3" title={album.cover}>
                                    Cover: {album.cover}
                                  </p>
                                </div>
                              )}
                              
                              {/* Tracks List */}
                              {album.tracks.length > 0 && (
                                <div className="mt-4 space-y-2">
                                  <h4 className="text-xs sm:text-sm font-medium text-gray-300">Tracks:</h4>
                                  {album.tracks.map((track) => (
                                    <div key={track.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-music-hover p-2 rounded gap-2">
                                      {editingTrack === track.id ? (
                                        <div className="flex-1 space-y-2">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <Input
                                              value={editTrackData.title}
                                              onChange={(e) => setEditTrackData(prev => ({ ...prev, title: e.target.value }))}
                                              placeholder="Title"
                                              className="text-xs"
                                            />
                                            <Input
                                              value={editTrackData.artist}
                                              onChange={(e) => setEditTrackData(prev => ({ ...prev, artist: e.target.value }))}
                                              placeholder="Artist"
                                              className="text-xs"
                                            />
                                          </div>
                                          <Input
                                            value={editTrackData.audioUrl}
                                            onChange={(e) => setEditTrackData(prev => ({ ...prev, audioUrl: e.target.value }))}
                                            placeholder="Song URL"
                                            className="text-xs"
                                          />
                                          <div className="flex gap-2 justify-end">
                                            <Button size="sm" onClick={handleSaveTrack} className="bg-music-primary text-black hover:bg-music-highlight text-xs">
                                              <Save className="h-3 w-3 mr-1" />
                                              Save
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setEditingTrack(null)} className="text-xs">
                                              <X className="h-3 w-3 mr-1" />
                                              Cancel
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm text-white truncate">{track.title}</p>
                                            <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                                            <p className="text-xs text-gray-500 truncate mt-1" title={track.audioUrl}>
                                              URL: {track.audioUrl}
                                            </p>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEditTrack(track)}
                                            className="self-start flex-shrink-0"
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
                        <p className="text-gray-400 text-sm">No albums created yet. Create your first album!</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'applink' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                App Download Link Management
              </CardTitle>
              <CardDescription className="text-sm">
                Manage the Android APK download link that appears on the Download page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="downloadLink" className="text-sm font-medium">Android APK Download URL</Label>
                  <Input
                    id="downloadLink"
                    type="url"
                    value={downloadLink}
                    onChange={(e) => setDownloadLink(e.target.value)}
                    placeholder="https://example.com/soundwave.apk"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    This link will be used for the Android download button on the Download page.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleDownloadLinkSave} 
                    className="bg-music-primary text-black hover:bg-music-highlight"
                  >
                    Save Download Link
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setDownloadLink('')}
                  >
                    Clear Link
                  </Button>
                </div>
                
                {downloadLink && (
                  <div className="mt-4 p-4 bg-music-cardBg rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-300 mb-2">Current download link:</p>
                    <p className="text-xs text-gray-400 break-all font-mono bg-gray-800 p-2 rounded">
                      {downloadLink}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Admin;
