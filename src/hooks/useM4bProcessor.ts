import { useState, useCallback } from 'react';
import { ProcessingState, ProgressUpdate } from '../types';
import { useFFmpeg } from './useFFmpeg';
import { extractChapters } from '../services/chapterExtractor';
import { convertAllChapters } from '../services/conversionService';
import { fetchFile } from '@ffmpeg/util';

export const useM4bProcessor = () => {
  const { ffmpegRef, isLoading: isFFmpegLoading, load: loadFFmpeg } = useFFmpeg();

  const [state, setState] = useState<ProcessingState>({
    status: 'idle',
    file: null,
    chapters: [],
    results: [],
    progress: { current: 0, total: 0 },
    error: null,
  });

  const processFile = useCallback(
    async (file: File) => {
      setState((prev) => ({
        ...prev,
        status: 'uploading',
        file,
        error: null,
      }));

      try {
        // Load FFmpeg if not already loaded
        if (!ffmpegRef.current) {
          console.log('FFmpeg not loaded, loading now...');
          await loadFFmpeg();
        }

        // Get the current ffmpeg instance from the ref
        const currentFFmpeg = ffmpegRef.current;

        if (!currentFFmpeg) {
          throw new Error('FFmpeg failed to load. Please check the console for details.');
        }

        console.log('FFmpeg is ready, proceeding with file processing');

        // Write input file to FFmpeg virtual filesystem
        setState((prev) => ({ ...prev, status: 'extracting' }));
        await currentFFmpeg.writeFile('input.m4b', await fetchFile(file));

        // Extract chapters
        const chapters = await extractChapters(currentFFmpeg, file);

        // Stop here and wait for user to click Convert
        setState((prev) => ({
          ...prev,
          chapters,
          status: 'idle', // Change to idle so user can edit and click Convert
          progress: { current: 0, total: chapters.length },
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error('Unknown error occurred');
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: errorMessage,
        }));
        console.error('Processing error:', error);
      }
    },
    [ffmpegRef, loadFFmpeg]
  );

  const convertChapters = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'converting' }));

    try {
      const currentFFmpeg = ffmpegRef.current;

      if (!currentFFmpeg) {
        throw new Error('FFmpeg is not loaded');
      }

      const { chapters } = state;

      // Convert chapters with edited names
      const results = await convertAllChapters(
        currentFFmpeg,
        chapters,
        (progress: ProgressUpdate) => {
          setState((prev) => ({
            ...prev,
            progress: {
              current: progress.current,
              total: progress.total,
            },
          }));
        }
      );

      // Clean up input file
      await currentFFmpeg.deleteFile('input.m4b');

      setState((prev) => ({
        ...prev,
        status: 'completed',
        results,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error('Unknown error occurred');
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
      console.error('Conversion error:', error);
    }
  }, [ffmpegRef, state]);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      file: null,
      chapters: [],
      results: [],
      progress: { current: 0, total: 0 },
      error: null,
    });
  }, []);

  const editChapter = useCallback((chapterNumber: number, newTitle: string) => {
    setState((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) =>
        ch.number === chapterNumber ? { ...ch, editedTitle: newTitle } : ch
      ),
    }));
  }, []);

  return {
    ...state,
    isFFmpegLoading,
    processFile,
    convertChapters,
    reset,
    editChapter,
  };
};
