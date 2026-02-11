import { createId } from '@/types/webbook';

export async function uploadMedia(file: File, folder = 'media'): Promise<{ url: string; name: string; id: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload error: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  return {
    url: data.url,
    name: data.name,
    id: data.id,
  };
}
