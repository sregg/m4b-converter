import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Chapter } from '../types';

export const extractChapters = async (ffmpeg: FFmpeg, file: File): Promise<Chapter[]> => {
  try {
    const inputFileName = 'input.m4b';
    const metadataFileName = 'metadata.txt';

    // Write M4B file to FFmpeg virtual filesystem
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));

    // Extract metadata using ffmpeg
    await ffmpeg.exec(['-i', inputFileName, '-f', 'ffmetadata', metadataFileName]);

    // Read the metadata file
    const data = await ffmpeg.readFile(metadataFileName);
    const metadataText = new TextDecoder().decode(data as Uint8Array);

    // Parse chapters from metadata
    const chapters = parseChapterMetadata(metadataText);

    // Clean up
    await ffmpeg.deleteFile(metadataFileName);

    return chapters;
  } catch (error) {
    console.error('Failed to extract chapters:', error);
    throw new Error(
      'Failed to extract chapters from M4B file. The file may be corrupted or unsupported.'
    );
  }
};

const parseChapterMetadata = (metadata: string): Chapter[] => {
  const chapters: Chapter[] = [];
  const lines = metadata.split('\n');

  let currentChapter: Partial<Chapter> | null = null;
  let chapterNumber = 1;
  let timebaseMultiplier = 1; // Multiplier to convert timestamps to milliseconds

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Parse timebase
    if (line.startsWith('TIMEBASE=')) {
      const timebaseMatch = line.match(/TIMEBASE=(\d+)\/(\d+)/);
      if (timebaseMatch) {
        const numerator = parseInt(timebaseMatch[1], 10);
        const denominator = parseInt(timebaseMatch[2], 10);
        // TIMEBASE=1/1000 means timestamps are in units of 1/1000 seconds (milliseconds)
        // To convert to milliseconds: multiply by (numerator/denominator) * 1000
        timebaseMultiplier = (numerator / denominator) * 1000;
      }
    }

    // Start of a chapter
    if (line === '[CHAPTER]') {
      if (
        currentChapter &&
        currentChapter.start !== undefined &&
        currentChapter.end !== undefined
      ) {
        // Save previous chapter
        chapters.push({
          number: chapterNumber++,
          title: currentChapter.title || `Chapter ${chapterNumber - 1}`,
          start: currentChapter.start,
          end: currentChapter.end,
          duration: currentChapter.end - currentChapter.start,
        });
      }
      currentChapter = {};
    }

    // Parse chapter properties
    if (currentChapter !== null) {
      if (line.startsWith('START=')) {
        const start = parseInt(line.substring(6), 10);
        currentChapter.start = Math.floor(start * timebaseMultiplier);
      } else if (line.startsWith('END=')) {
        const end = parseInt(line.substring(4), 10);
        currentChapter.end = Math.floor(end * timebaseMultiplier);
      } else if (line.startsWith('title=')) {
        currentChapter.title = line.substring(6);
      }
    }
  }

  // Add the last chapter
  if (currentChapter && currentChapter.start !== undefined && currentChapter.end !== undefined) {
    chapters.push({
      number: chapterNumber,
      title: currentChapter.title || `Chapter ${chapterNumber}`,
      start: currentChapter.start,
      end: currentChapter.end,
      duration: currentChapter.end - currentChapter.start,
    });
  }

  if (chapters.length === 0) {
    throw new Error('No chapters found in the M4B file');
  }

  return chapters;
};
