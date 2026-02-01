import React from 'react';
import { ConversionResult } from '../types';
import { downloadFile, downloadZip } from '../utils/downloadHelpers';
import { formatFileSize } from '../utils/fileHelpers';
import { sanitizeFilename } from '../utils/fileHelpers';

interface DownloadPanelProps {
  results: ConversionResult[];
  originalFilename: string;
}

export const DownloadPanel: React.FC<DownloadPanelProps> = ({ results, originalFilename }) => {
  const handleDownloadIndividual = (result: ConversionResult) => {
    const chapterTitle = result.chapter.editedTitle || result.chapter.title;
    const filename = sanitizeFilename(
      `${result.chapter.number.toString().padStart(2, '0')} - ${chapterTitle}.mp3`
    );
    downloadFile(result.blob, filename);
  };

  const handleDownloadAll = async () => {
    try {
      await downloadZip(results, originalFilename);
    } catch (error) {
      console.error('Failed to create ZIP:', error);
      alert('Failed to create ZIP file. Please try downloading chapters individually.');
    }
  };

  const totalSize = results.reduce((sum, result) => sum + result.size, 0);

  return (
    <div className="download-panel">
      <div className="download-header">
        <h2>Download Converted Files</h2>
        <button className="download-all-button" onClick={handleDownloadAll}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download All as ZIP ({formatFileSize(totalSize)})
        </button>
      </div>

      <div className="download-list">
        {results.map((result) => {
          const chapterTitle = result.chapter.editedTitle || result.chapter.title;
          return (
            <div key={result.chapter.number} className="download-item">
              <div className="download-info">
                <span className="download-title">
                  {result.chapter.number.toString().padStart(2, '0')} - {chapterTitle}
                </span>
                <span className="download-size">{formatFileSize(result.size)}</span>
              </div>
              <button className="download-button" onClick={() => handleDownloadIndividual(result)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
