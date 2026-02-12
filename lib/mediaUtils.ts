// Verifica se uma URL é de vídeo baseado na extensão
export const isVideoUrl = (url: string | null): boolean => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v', '.ogv'];
  const urlLower = url.toLowerCase();
  return videoExtensions.some(ext => urlLower.includes(ext));
};

// Verifica se um arquivo é vídeo baseado no tipo
export const isVideoFile = (file: File): boolean => {
  return file.type.startsWith('video/');
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

// Obtém a duração de um arquivo de vídeo em segundos
export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error('Não foi possível carregar o vídeo'));
    };

    video.src = window.URL.createObjectURL(file);
  });
};

// Valida se um vídeo está dentro do limite de duração (30 segundos)
export const validateVideoDuration = async (file: File, maxDuration: number = 30): Promise<{ valid: boolean; duration: number; message?: string }> => {
  if (!isVideoFile(file)) {
    return { valid: true, duration: 0 };
  }

  try {
    const duration = await getVideoDuration(file);
    const valid = duration <= maxDuration;

    if (!valid) {
      return {
        valid: false,
        duration,
        message: `Vídeo muito longo! Duração: ${duration.toFixed(1)}s. Máximo permitido: ${maxDuration}s.`
      };
    }

    return { valid: true, duration };
  } catch (error) {
    return {
      valid: false,
      duration: 0,
      message: 'Erro ao validar vídeo. Tente novamente.'
    };
  }
};
