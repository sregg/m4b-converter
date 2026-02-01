export interface Chapter {
  number: number;
  title: string;
  start: number;      // milliseconds
  end: number;        // milliseconds
  duration: number;   // milliseconds
  editedTitle?: string; // User-edited title
}

export interface ConversionResult {
  chapter: Chapter;
  blob: Blob;
  size: number;
}

export type ProcessingStatus =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'converting'
  | 'completed'
  | 'error';

export interface ProcessingState {
  status: ProcessingStatus;
  file: File | null;
  chapters: Chapter[];
  results: ConversionResult[];
  progress: {
    current: number;
    total: number;
  };
  error: Error | null;
}

export interface ProgressUpdate {
  current: number;
  total: number;
  message?: string;
}
