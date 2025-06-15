
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";

export interface DownloadLink {
  id: string;
  platform: 'android' | 'ios';
  download_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Function to get download links
export const getDownloadLinks = async (): Promise<DownloadLink[]> => {
  try {
    const { data, error } = await supabase
      .from('app_download_links')
      .select('*')
      .order('platform');

    if (error) {
      console.error('Error fetching download links:', error);
      return [];
    }

    // Type assertion to ensure platform is correctly typed
    return (data || []) as DownloadLink[];
  } catch (error) {
    console.error('Error in getDownloadLinks:', error);
    return [];
  }
};

// Function to update download link
export const updateDownloadLink = async (
  platform: 'android' | 'ios',
  downloadUrl: string,
  isActive: boolean = true
): Promise<boolean> => {
  try {
    const { error } = await supabaseAdmin
      .from('app_download_links')
      .update({
        download_url: downloadUrl,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('platform', platform);

    if (error) {
      console.error('Error updating download link:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateDownloadLink:', error);
    return false;
  }
};

// Function to get active download link for a platform
export const getActiveDownloadLink = async (platform: 'android' | 'ios'): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('app_download_links')
      .select('download_url, is_active')
      .eq('platform', platform)
      .single();

    if (error) {
      console.error('Error fetching download link:', error);
      return null;
    }

    return data?.is_active && data?.download_url ? data.download_url : null;
  } catch (error) {
    console.error('Error in getActiveDownloadLink:', error);
    return null;
  }
};

export const downloadService = {
  getDownloadLinks,
  updateDownloadLink,
  getActiveDownloadLink,
};
