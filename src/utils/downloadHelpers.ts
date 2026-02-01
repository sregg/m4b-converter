import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ConversionResult } from '../types';
import { sanitizeFilename } from './fileHelpers';

export const downloadFile = (blob: Blob, filename: string): void => {
  const sanitized = sanitizeFilename(filename);
  saveAs(blob, sanitized);
};

export const createZip = async (results: ConversionResult[], _zipName: string): Promise<Blob> => {
  const zip = new JSZip();

  // Add each MP3 to the zip
  results.forEach((result) => {
    const chapterTitle = result.chapter.editedTitle || result.chapter.title;
    const filename = sanitizeFilename(
      `${result.chapter.number.toString().padStart(2, '0')} - ${chapterTitle}.mp3`
    );
    zip.file(filename, result.blob);
  });

  // Generate the zip file
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return zipBlob;
};

export const downloadZip = async (
  results: ConversionResult[],
  originalFilename: string
): Promise<void> => {
  const zipName = originalFilename.replace(/\.m4b$/i, '.zip');
  const zipBlob = await createZip(results, zipName);
  downloadFile(zipBlob, zipName);
};
