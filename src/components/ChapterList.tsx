import React, { useState } from 'react';
import { Chapter } from '../types';
import { formatDuration } from '../utils/fileHelpers';

interface ChapterListProps {
  chapters: Chapter[];
  currentChapter?: number;
  completedChapters?: number[];
  onEditChapter?: (chapterNumber: number, newTitle: string) => void;
  isProcessing?: boolean;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  currentChapter,
  completedChapters = [],
  onEditChapter,
  isProcessing = false
}) => {
  const [editingChapter, setEditingChapter] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  if (chapters.length === 0) {
    return null;
  }

  const handleStartEdit = (chapter: Chapter) => {
    if (isProcessing) return;
    setEditingChapter(chapter.number);
    setEditValue(chapter.editedTitle || chapter.title);
  };

  const handleSaveEdit = (chapterNumber: number) => {
    if (onEditChapter && editValue.trim()) {
      onEditChapter(chapterNumber, editValue.trim());
    }
    setEditingChapter(null);
  };

  const handleCancelEdit = () => {
    setEditingChapter(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, chapterNumber: number) => {
    if (e.key === 'Enter') {
      handleSaveEdit(chapterNumber);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="chapter-list">
      <h2>Chapters ({chapters.length})</h2>
      {!isProcessing && (
        <p className="chapter-hint">Click on a chapter name to edit it</p>
      )}
      <div className="chapters">
        {chapters.map((chapter) => {
          const isCompleted = completedChapters.includes(chapter.number);
          const isCurrent = currentChapter === chapter.number;
          const isEditing = editingChapter === chapter.number;
          const displayTitle = chapter.editedTitle || chapter.title;

          return (
            <div
              key={chapter.number}
              className={`chapter-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="chapter-status">
                {isCompleted ? (
                  <svg className="status-icon completed" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isCurrent ? (
                  <div className="status-icon spinner"></div>
                ) : (
                  <div className="status-icon pending"></div>
                )}
              </div>
              <div className="chapter-info">
                <div className="chapter-title">
                  <span className="chapter-number">Chapter {chapter.number}</span>
                  {isEditing ? (
                    <div className="chapter-edit">
                      <input
                        type="text"
                        className="chapter-edit-input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, chapter.number)}
                        onBlur={() => handleSaveEdit(chapter.number)}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="chapter-name-wrapper">
                      <span
                        className={`chapter-name ${!isProcessing ? 'editable' : ''}`}
                        onClick={() => handleStartEdit(chapter)}
                        title={!isProcessing ? 'Click to edit' : ''}
                      >
                        {displayTitle}
                        {chapter.editedTitle && <span className="edited-indicator"> ✓</span>}
                      </span>
                      {!isProcessing && (
                        <button
                          className="edit-icon-button"
                          onClick={() => handleStartEdit(chapter)}
                          title="Edit chapter name"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="chapter-duration">{formatDuration(chapter.duration)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
