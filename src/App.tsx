import React, { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FileUpload } from './components/FileUpload';
import { ChapterList } from './components/ChapterList';
import { ProgressBar } from './components/ProgressBar';
import { DownloadPanel } from './components/DownloadPanel';
import { useM4bProcessor } from './hooks/useM4bProcessor';
import './App.css';

function App() {
  const {
    status,
    file,
    chapters,
    results,
    progress,
    error,
    isFFmpegLoading,
    processFile,
    convertChapters,
    reset,
    editChapter,
  } = useM4bProcessor();

  const [sharedArrayBufferAvailable, setSharedArrayBufferAvailable] = React.useState(true);

  // Check for SharedArrayBuffer support on mount
  useEffect(() => {
    console.log('=== Browser Compatibility Check ===');
    console.log('SharedArrayBuffer available:', typeof SharedArrayBuffer !== 'undefined');
    console.log('crossOriginIsolated:', window.crossOriginIsolated);

    if (typeof SharedArrayBuffer === 'undefined') {
      setSharedArrayBufferAvailable(false);
      console.error('SharedArrayBuffer is not available.');
      console.error(
        'Please close this tab completely and open a new tab at http://localhost:5173/'
      );
      console.error('Or do a hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)');
    } else {
      setSharedArrayBufferAvailable(true);
      console.log('✓ Browser is compatible and properly configured!');
    }
  }, []);

  const isProcessing = status === 'uploading' || status === 'extracting' || status === 'converting';
  const showUpload = (status === 'idle' && chapters.length === 0) || status === 'error';
  const showChapters = chapters.length > 0;
  const showProgress = status === 'converting';
  const showDownload = status === 'completed' && results.length > 0;
  const showConvertButton = status === 'idle' && chapters.length > 0 && results.length === 0;

  const getStatusMessage = () => {
    switch (status) {
      case 'uploading':
        return 'Loading file...';
      case 'extracting':
        return 'Extracting chapters...';
      case 'converting':
        return `Converting chapter ${progress.current} of ${progress.total}...`;
      case 'completed':
        return 'Conversion complete!';
      case 'error':
        return error?.message || 'An error occurred';
      default:
        return '';
    }
  };

  const completedChapters = results.map((r) => r.chapter.number);
  const currentChapter =
    status === 'converting' && progress.current > 0
      ? chapters[progress.current - 1]?.number
      : undefined;

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <h1>M4B/AAX to MP3 Converter</h1>
          <p>
            Convert M4B and AAX audiobook files to MP3 chapters - All processing happens in your
            browser
          </p>
          <p className="drm-notice">
            ⚠️ DRM-protected files (e.g., from Audible) cannot be converted. Only DRM-free files are
            supported.
          </p>
        </header>

        {!sharedArrayBufferAvailable && (
          <div className="compatibility-warning">
            <h3>⚠️ Browser Configuration Required</h3>
            <p>SharedArrayBuffer is not available. To fix this:</p>
            <ol>
              <li>
                <strong>Close this browser tab completely</strong>
              </li>
              <li>Open a new tab</li>
              <li>
                Navigate to <code>http://localhost:5173/</code>
              </li>
            </ol>
            <p>
              Or do a hard refresh: <kbd>Ctrl+Shift+R</kbd> (Windows/Linux) or{' '}
              <kbd>Cmd+Shift+R</kbd> (Mac)
            </p>
          </div>
        )}

        <main className="app-main">
          {isFFmpegLoading && (
            <div className="loading-message">
              <div className="spinner large"></div>
              <p>Loading FFmpeg... This may take a moment on first use.</p>
            </div>
          )}

          {showUpload && !isFFmpegLoading && (
            <FileUpload onFileSelect={processFile} disabled={isProcessing} />
          )}

          {file && (
            <div className="file-info">
              <p>
                <strong>File:</strong> {file.name}
              </p>
              {status !== 'idle' && (
                <p className={`status ${status}`}>
                  <strong>Status:</strong> {getStatusMessage()}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="error-message">
              <h3>Error</h3>
              <p>{error.message}</p>
              <button onClick={reset} className="reset-button">
                Try Another File
              </button>
            </div>
          )}

          {showProgress && (
            <ProgressBar
              current={progress.current}
              total={progress.total}
              message={getStatusMessage()}
            />
          )}

          {showChapters && (
            <ChapterList
              chapters={chapters}
              currentChapter={currentChapter}
              completedChapters={completedChapters}
              onEditChapter={editChapter}
              isProcessing={isProcessing}
            />
          )}

          {showConvertButton && (
            <div className="convert-action">
              <p className="convert-hint">
                Edit chapter names if needed, then click Convert to start processing.
              </p>
              <button onClick={convertChapters} className="convert-button">
                Convert to MP3
              </button>
            </div>
          )}

          {showDownload && (
            <>
              <DownloadPanel results={results} originalFilename={file?.name || 'audiobook'} />
              <button onClick={reset} className="reset-button">
                Convert Another File
              </button>
            </>
          )}
        </main>

        <footer className="app-footer">
          <p>
            Privacy: All processing happens locally in your browser. No files are uploaded to any
            server.
          </p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
