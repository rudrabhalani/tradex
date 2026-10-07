import React, { useState, useRef, useCallback } from 'react';
import { analyzeChart, chatFollowUp } from '../services/api';

export default function InputArea({ conversationHistory, isLoading, setIsLoading, addMessage }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFile = useCallback((f) => {
    setError(null);
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('Please upload a PNG, JPG, or WEBP image.');
      return;
    }
    if (f.size > MAX_SIZE) {
      setError('Image must be under 10MB.');
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(f);
  }, []);

  const removeImage = () => {
    setFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    if (!file && !text.trim()) return;

    setError(null);
    const currentText = text.trim();
    const currentFile = file;
    const currentPreview = imagePreview;
    
    // Add user message
    addMessage('user', currentText || (currentFile ? 'Analyze this chart' : ''), currentPreview);
    
    // Clear inputs
    setText('');
    setFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setIsLoading(true);

    try {
      let result;
      if (currentFile) {
        result = await analyzeChart(currentFile, currentText, conversationHistory());
      } else {
        result = await chatFollowUp(currentText, conversationHistory());
      }
      addMessage('assistant', result.analysis);
    } catch (err) {
      addMessage('assistant', `⚠️ ${err.message || 'Something went wrong. Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Drag and drop
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  // Auto-resize textarea
  const handleTextChange = (e) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 150) + 'px';
  };

  return (
    <div
      className={`border-t border-gray-200 px-4 py-3 ${
        isDragging ? 'bg-gray-50 border-t-2 border-t-black' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="max-w-3xl mx-auto">
        {/* Error */}
        {error && (
          <div className="mb-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700">
            {error}
          </div>
        )}

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-2 relative inline-block">
            <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg border border-gray-200" />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-700 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-2 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 focus-within:border-black transition-colors">
          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-40 shrink-0"
            title="Upload chart image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            onChange={(e) => handleFile(e.target.files[0])}
            className="hidden"
          />

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={file ? 'Add context (optional)...' : 'Upload a chart or ask a question...'}
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-sm py-1.5 placeholder:text-gray-400 disabled:opacity-40 max-h-[150px]"
          />

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || (!file && !text.trim())}
            className="p-1.5 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            title="Analyze"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Drag hint */}
        {isDragging && (
          <div className="mt-2 text-center text-sm text-gray-500">
            Drop your chart image here
          </div>
        )}
      </div>
    </div>
  );
}
