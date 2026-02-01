import { useState, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

interface UseFFmpegReturn {
  ffmpeg: FFmpeg | null;
  ffmpegRef: React.MutableRefObject<FFmpeg | null>;
  isLoading: boolean;
  isReady: boolean;
  error: Error | null;
  load: () => Promise<void>;
  cleanup: () => void;
}

export const useFFmpeg = (): UseFFmpegReturn => {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (isReady || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check for SharedArrayBuffer support
      if (typeof SharedArrayBuffer === 'undefined') {
        console.error('SharedArrayBuffer is not available');
        console.error('Current headers:', {
          coop: document.head.querySelector('meta[http-equiv="Cross-Origin-Opener-Policy"]'),
          coep: document.head.querySelector('meta[http-equiv="Cross-Origin-Embedder-Policy"]')
        });
        throw new Error(
          'SharedArrayBuffer is not available. Please ensure your server is configured with COOP and COEP headers. Try restarting the dev server.'
        );
      }

      console.log('SharedArrayBuffer is available, loading FFmpeg...');

      // Create FFmpeg instance
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      // Set up logging
      ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]:', message);
      });

      // Load FFmpeg core - try multiple CDN sources
      console.log('Loading FFmpeg from CDN...');

      const cdnOptions = [
        {
          name: 'unpkg.com',
          coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
          wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
        },
        {
          name: 'jsdelivr.net',
          coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
          wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
        }
      ];

      let loaded = false;
      let lastError: Error | null = null;

      for (const cdn of cdnOptions) {
        try {
          console.log(`Trying to load from ${cdn.name}...`);
          await ffmpeg.load({
            coreURL: cdn.coreURL,
            wasmURL: cdn.wasmURL,
            workerURL: cdn.coreURL.replace('ffmpeg-core.js', 'ffmpeg-core.worker.js'),
          });
          console.log(`✓ Successfully loaded from ${cdn.name}`);
          loaded = true;
          break;
        } catch (err) {
          console.warn(`Failed to load from ${cdn.name}:`, err);
          lastError = err instanceof Error ? err : new Error(`Failed to load from ${cdn.name}`);
        }
      }

      if (!loaded) {
        throw lastError || new Error('Failed to load FFmpeg from all CDN sources');
      }

      setIsReady(true);
      console.log('FFmpeg loaded successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load FFmpeg');
      setError(error);
      console.error('Failed to load FFmpeg:', error);
      console.error('Error details:', err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isReady, isLoading]);

  const cleanup = useCallback(() => {
    if (ffmpegRef.current) {
      // Cleanup virtual filesystem if needed
      ffmpegRef.current = null;
      setIsReady(false);
    }
  }, []);

  return {
    ffmpeg: ffmpegRef.current,
    ffmpegRef,
    isLoading,
    isReady,
    error,
    load,
    cleanup
  };
};
