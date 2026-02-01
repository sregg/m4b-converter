import { FFmpeg } from '@ffmpeg/ffmpeg';
import { Chapter, ConversionResult, ProgressUpdate } from '../types';
import { formatTimestamp } from '../utils/fileHelpers';

export const convertChapterToMp3 = async (
  ffmpeg: FFmpeg,
  chapter: Chapter,
  inputFileName: string
): Promise<Blob> => {
  const outputFileName = `chapter_${chapter.number}.mp3`;

  try {
    // Format timestamps for FFmpeg
    const startTime = formatTimestamp(chapter.start);
    const duration = formatTimestamp(chapter.duration);

    // Convert chapter to MP3
    await ffmpeg.exec([
      '-i',
      inputFileName,
      '-ss',
      startTime,
      '-t',
      duration,
      '-vn', // No video
      '-acodec',
      'libmp3lame',
      '-b:a',
      '128k',
      '-metadata',
      `title=${chapter.editedTitle || chapter.title}`,
      '-metadata',
      `track=${chapter.number}`,
      outputFileName,
    ]);

    // Read the output file
    const data = await ffmpeg.readFile(outputFileName);
    // Convert to regular Uint8Array to avoid SharedArrayBuffer issues
    const uint8Array = new Uint8Array(data as Uint8Array);
    const blob = new Blob([uint8Array], { type: 'audio/mpeg' });

    // Clean up the output file from virtual filesystem
    await ffmpeg.deleteFile(outputFileName);

    return blob;
  } catch (error) {
    console.error(`Failed to convert chapter ${chapter.number}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('FFmpeg error details:', errorMessage);
    throw new Error(
      `Failed to convert chapter ${chapter.number}: ${chapter.title}. ${errorMessage.includes('Invalid') || errorMessage.includes('moov') ? 'This file may be DRM-protected.' : ''}`
    );
  }
};

export const convertAllChapters = async (
  ffmpeg: FFmpeg,
  chapters: Chapter[],
  inputFileName: string,
  onProgress?: (progress: ProgressUpdate) => void
): Promise<ConversionResult[]> => {
  const results: ConversionResult[] = [];

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];

    // Update progress
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: chapters.length,
        message: `Converting chapter ${i + 1} of ${chapters.length}: ${chapter.title}`,
      });
    }

    try {
      const blob = await convertChapterToMp3(ffmpeg, chapter, inputFileName);

      results.push({
        chapter,
        blob,
        size: blob.size,
      });
    } catch (error) {
      console.error(`Error converting chapter ${chapter.number}:`, error);
      throw error;
    }
  }

  return results;
};
