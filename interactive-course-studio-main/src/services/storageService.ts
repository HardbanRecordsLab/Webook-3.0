import { supabase } from '@/integrations/supabase/client';
import { createId } from '@/types/webbook';

export async function uploadMedia(file: File, folder = 'media'): Promise<{ url: string; name: string; id: string }> {
  const ext = file.name.split('.').pop();
  const id = createId();
  const path = `${folder}/${id}.${ext}`;

  const { error } = await supabase.storage
    .from('webbook-media')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw new Error(`Upload error: ${error.message}`);

  const { data } = supabase.storage.from('webbook-media').getPublicUrl(path);

  return {
    url: data.publicUrl,
    name: file.name,
    id,
  };
}
