export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

export const isValidM4bFile = (file: File): { valid: boolean; error?: string } => {
  // Check file extension
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.m4b') && !fileName.endsWith('.aax')) {
    return {
      valid: false,
      error: 'Please select a valid M4B or AAX file',
    };
  }

  // Check file size (2GB browser limit, warn at 500MB)
  const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
  const warnSize = 500 * 1024 * 1024; // 500MB

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File is too large (max 2GB)',
    };
  }

  if (file.size > warnSize) {
    return {
      valid: true,
      error: 'Warning: Large files may cause memory issues',
    };
  }

  return { valid: true };
};

export const sanitizeFilename = (filename: string): string => {
  // Remove invalid characters for filenames
  return filename
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const formatDuration = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const formatTimestamp = (milliseconds: number): string => {
  const totalSeconds = milliseconds / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = (totalSeconds % 60).toFixed(3);

  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.padStart(6, '0')}`;
};
