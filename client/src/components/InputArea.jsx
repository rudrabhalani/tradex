import React, { useState, useRef, useCallback } from 'react';
import { analyzeChart, chatFollowUp } from '../services/api';
import voiceService from '../services/voiceService';

export default function InputArea({ conversationHistory, isLoading, setIsLoading, addMessage, user }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);
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

  const toggleVoiceInput = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      return;
    }

    if (!voiceService.isSpeechRecognitionSupported()) {
      setError('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    setError(null);
    setIsListening(true);

    voiceService.startListening(
      (transcript, isFinal) => {
        setText(prev => {
          const space = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
          return prev + space + transcript;
        });
      },
      () => {
        setIsListening(false);
      },
      (err) => {
        setIsListening(false);
        if (err !== 'no-speech') {
          setError(`Microphone error: ${err}`);
        }
      }
    );
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    if (!file && !text.trim()) return;

    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    }

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
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    setIsLoading(true);

    try {
      let result;
      if (currentFile) {
        result = await analyzeChart(currentFile, currentText, conversationHistory(), user);
      } else {
        result = await chatFollowUp(currentText, conversationHistory(), user);
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
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  return (
    <div
      className={`border-t border-gray-200 dark:border-zinc-800/80 px-4 py-3 bg-white dark:bg-[#09090b] transition-colors ${
        isDragging ? 'bg-gray-50 dark:bg-zinc-900 border-t-2 border-t-black dark:border-t-white' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="max-w-3xl mx-auto">
        {/* Error notification */}
        {error && (
          <div className="mb-2 px-3.5 py-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 font-bold ml-2">×</button>
          </div>
        )}

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-2.5 relative inline-block">
            <img src={imagePreview} alt="Preview" className="max-h-32 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-md object-contain bg-black/5" />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-xs font-bold hover:scale-110 shadow-md transition-all"
            >
              ×
            </button>
          </div>
        )}

        {/* Input box */}
        <div className="flex items-end gap-2 bg-gray-50 dark:bg-[#18181c] border border-gray-300 dark:border-zinc-800 rounded-2xl px-3 py-2.5 focus-within:border-black dark:focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-black/10 dark:focus-within:ring-white/10 transition-all shadow-sm">
          {/* Chart Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-colors disabled:opacity-40 shrink-0"
            title="Upload chart screenshot (PNG, JPG, WEBP)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            onChange={(e) => handleFile(e.target.files[0])}
            className="hidden"
          />

          {/* Voice Assistant Microphone Button */}
          <button
            onClick={toggleVoiceInput}
            disabled={isLoading}
            className={`p-2 rounded-xl transition-all shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30'
                : 'hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300'
            }`}
            title={isListening ? 'Stop listening' : 'Speak to AI Voice Assistant'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : file
                ? 'Add instructions or press Send to analyze...'
                : 'Upload a chart or ask anything...'
            }
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-sm py-1.5 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 disabled:opacity-40 max-h-[160px]"
          />

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || (!file && !text.trim())}
            className="p-2 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-sm"
            title="Send (Enter)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Drag Hint */}
        {isDragging && (
          <div className="mt-2 text-center text-xs font-semibold text-gray-500 dark:text-zinc-400">
            Drop your financial chart screenshot here
          </div>
        )}
      </div>
    </div>
  );
}
