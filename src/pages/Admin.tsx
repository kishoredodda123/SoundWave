import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle } from "lucide-react";
import MainLayout from '@/components/layout/MainLayout';
import { musicService } from '@/services/musicService';
import { supabase } from '@/integrations/supabase/client';

const Admin = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<any>(null);
  const [musicFiles, setMusicFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMusicFiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('music_files')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMusicFiles(data || []);
    } catch (error) {
      console.error('Error loading music files:', error);
      toast({
        title: "Error",
        description: "Failed to load music files.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncBackblaze = async () => {
    setIsSyncing(true);
    setSyncResults(null);
    
    try {
      // Call the syncBackblazeToSupabase function
      const result = await musicService.syncBackblazeToSupabase();
      
      setSyncResults(result);
      
      toast({
        title: "Sync Complete",
        description: `Processed ${result.processed || 0} files from Backblaze.`,
      });
      
      // Refresh the file list
      await loadMusicFiles();
    } catch (error) {
      console.error('Error syncing with Backblaze:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      
      setSyncResults({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Load music files when component mounts
  useEffect(() => {
    loadMusicFiles();
  }, []);

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Backblaze Sync Card */}
          <Card>
            <CardHeader>
              <CardTitle>Backblaze Sync</CardTitle>
              <CardDescription>Synchronize music files from Backblaze B2 storage.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">
                This will scan your Backblaze storage for music files and import them into the database.
              </p>
              
              {syncResults && (
                <div className={`p-3 rounded-md mb-4 ${syncResults.success ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                  {syncResults.success ? (
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <div>
                        <p className="font-medium">Sync completed successfully</p>
                        <p className="text-sm text-gray-400">
                          Processed {syncResults.processed} files
                          {syncResults.added && ` (${syncResults.added} added)`}
                          {syncResults.updated && `, ${syncResults.updated} updated`}
                          {syncResults.skipped && `, ${syncResults.skipped} unchanged`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <div>
                        <p className="font-medium">Sync failed</p>
                        <p className="text-sm text-gray-400">{syncResults.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSyncBackblaze} 
                disabled={isSyncing}
                className="bg-music-primary text-black hover:bg-music-highlight"
              >
                {isSyncing ? "Syncing..." : "Sync with Backblaze"}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Music Library Stats</CardTitle>
              <CardDescription>Current status of your music library.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Total Tracks</div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{musicFiles.length}</div>
                  )}
                </div>
                
                <div>
                  <div className="text-sm text-gray-400 mb-1">Storage Used</div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {(musicFiles.reduce((total, file) => total + (file.file_size || 0), 0) / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={loadMusicFiles}
                disabled={isLoading}
              >
                Refresh Stats
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Music Files Table */}
        <Card>
          <CardHeader>
            <CardTitle>Music Files</CardTitle>
            <CardDescription>Recent music files in your library.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-music-hover">
                  <tr>
                    <th scope="col" className="px-6 py-3">Title</th>
                    <th scope="col" className="px-6 py-3">Artist</th>
                    <th scope="col" className="px-6 py-3">Album</th>
                    <th scope="col" className="px-6 py-3">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, index) => (
                      <tr key={index} className="border-b border-music-hover">
                        <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                      </tr>
                    ))
                  ) : musicFiles.length > 0 ? (
                    musicFiles.slice(0, 10).map((file) => (
                      <tr key={file.id} className="border-b border-music-hover hover:bg-music-hover/50">
                        <td className="px-6 py-4">{file.title}</td>
                        <td className="px-6 py-4">{file.artist}</td>
                        <td className="px-6 py-4">{file.album || "—"}</td>
                        <td className="px-6 py-4">
                          {new Date(file.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-6 text-center text-gray-400">
                        No music files found. Sync with Backblaze to import files.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Admin;
