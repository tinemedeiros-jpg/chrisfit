// Verifica se uma URL é de vídeo baseado na extensão
export const isVideoUrl = (url: string | null): boolean => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v', '.ogv'];
  const urlLower = url.toLowerCase();
  return videoExtensions.some(ext => urlLower.includes(ext));
};

// Obtém o tipo MIME do vídeo baseado na extensão
export const getVideoMimeType = (url: string): string => {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('.webm')) return 'video/webm';
  if (urlLower.includes('.mov')) return 'video/quicktime';
  if (urlLower.includes('.avi')) return 'video/x-msvideo';
  if (urlLower.includes('.mkv')) return 'video/x-matroska';
  if (urlLower.includes('.ogv')) return 'video/ogg';
  return 'video/mp4'; // default
};
