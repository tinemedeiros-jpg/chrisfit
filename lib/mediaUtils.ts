// Tipo para progresso do corte de vídeo
export type VideoTrimProgress = {
  percent: number;
  currentTime: number;
  totalDuration: number;
};

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

// Corta um vídeo para os primeiros maxDuration segundos usando MediaRecorder
export const trimVideoTo30Seconds = (
  file: File,
  maxDuration: number = 30,
  onProgress?: (progress: VideoTrimProgress) => void
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.playsInline = true;
    video.muted = true; // Necessário para autoplay funcionar nos navegadores

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    video.preload = 'metadata';

    // Timeout de segurança - 2 minutos máximo
    const safetyTimeout = setTimeout(() => {
      video.ontimeupdate = null;
      video.pause();
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Tempo limite excedido ao processar o vídeo.'));
    }, 120000);

    video.onloadedmetadata = () => {
      if (video.duration <= maxDuration) {
        clearTimeout(safetyTimeout);
        URL.revokeObjectURL(objectUrl);
        onProgress?.({ percent: 100, currentTime: video.duration, totalDuration: video.duration });
        resolve(file);
        return;
      }

      const captureStream =
        'captureStream' in video
          ? () => (video as HTMLVideoElement & { captureStream(): MediaStream }).captureStream()
          : 'mozCaptureStream' in video
          ? () => (video as HTMLVideoElement & { mozCaptureStream(): MediaStream }).mozCaptureStream()
          : null;

      if (!captureStream || typeof MediaRecorder === 'undefined') {
        clearTimeout(safetyTimeout);
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Seu navegador não suporta corte automático de vídeo.'));
        return;
      }

      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4',
      ];
      const supportedMime = mimeTypes.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';

      const stream = captureStream();
      const chunks: BlobPart[] = [];
      const recorderOptions = supportedMime ? { mimeType: supportedMime } : {};
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        clearTimeout(safetyTimeout);
        URL.revokeObjectURL(objectUrl);
        const finalMime = supportedMime || 'video/webm';
        const ext = finalMime.includes('mp4') ? '.mp4' : '.webm';
        const blob = new Blob(chunks, { type: finalMime });
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const trimmedFile = new File([blob], `${baseName}_30s${ext}`, { type: finalMime });
        onProgress?.({ percent: 100, currentTime: maxDuration, totalDuration: maxDuration });
        resolve(trimmedFile);
      };

      mediaRecorder.onerror = () => {
        clearTimeout(safetyTimeout);
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Erro ao gravar o vídeo cortado.'));
      };

      mediaRecorder.start(100);
      video.play().catch(() => {
        clearTimeout(safetyTimeout);
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Não foi possível reproduzir o vídeo para corte. Tente um formato diferente.'));
      });

      video.ontimeupdate = () => {
        const progress = Math.min((video.currentTime / maxDuration) * 100, 100);
        onProgress?.({
          percent: progress,
          currentTime: video.currentTime,
          totalDuration: maxDuration
        });
        if (video.currentTime >= maxDuration) {
          video.ontimeupdate = null;
          video.pause();
          setTimeout(() => {
            if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
          }, 150);
        }
      };
    };

    video.onerror = () => {
      clearTimeout(safetyTimeout);
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Erro ao carregar o vídeo.'));
    };
  });
};
