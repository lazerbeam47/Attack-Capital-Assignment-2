"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  List, 
  ListOrdered,
  Type,
  Image,
  Paperclip,
  Smile,
  Send
} from "lucide-react";

// Debounce hook for performance optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string, plainText: string) => void;
  onSend?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showSendButton?: boolean;
}

interface TextFormat {
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  onSend,
  placeholder = "Type your message...",
  disabled = false,
  className = "",
  showSendButton = true,
}: RichTextEditorProps) {
  const [format, setFormat] = useState<TextFormat>({ bold: false, italic: false, underline: false });
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [internalValue, setInternalValue] = useState(value);
  const [internalPlainText, setInternalPlainText] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce the internal value to prevent excessive onChange calls
  const debouncedValue = useDebounce(internalValue, 300);
  const debouncedPlainText = useDebounce(internalPlainText, 300);

  // Call onChange only when debounced values change
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue, debouncedPlainText);
    }
  }, [debouncedValue, debouncedPlainText, onChange, value]);

  // Update format state based on cursor position
  const updateFormatState = useCallback(() => {
    if (!editorRef.current) return;

    setFormat({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    });
  }, []);

  // Handle content changes with debouncing to prevent excessive re-renders
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;
    
    const htmlContent = editorRef.current.innerHTML;
    const plainTextContent = editorRef.current.innerText || editorRef.current.textContent || "";
    
    // Update internal state immediately for responsiveness
    setInternalValue(htmlContent);
    setInternalPlainText(plainTextContent);
  }, []);

  // Toggle text formatting
  const toggleFormat = useCallback((command: string) => {
    if (disabled) return;
    
    document.execCommand(command);
    editorRef.current?.focus();
    updateFormatState();
    handleContentChange();
  }, [disabled, updateFormatState, handleContentChange]);

  // Initialize editor content only when value changes from external source
  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      const currentHtml = editorRef.current.innerHTML;
      // Only update if the value has actually changed and is different from current content
      if (value !== currentHtml && document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      // Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            toggleFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            toggleFormat('italic');
            break;
          case 'u':
            e.preventDefault();
            toggleFormat('underline');
            break;
          case 'Enter':
            e.preventDefault();
            if (onSend) onSend();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onSend, toggleFormat]);

  // Insert link
  const insertLink = () => {
    if (!linkUrl || !linkText) return;
    
    const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #000000; text-decoration: underline;">${linkText}</a>`;
    document.execCommand('insertHTML', false, linkHtml);
    
    setShowLinkDialog(false);
    setLinkUrl("");
    setLinkText("");
    editorRef.current?.focus();
    handleContentChange();
  };

  // Insert list
  const insertList = (ordered: boolean) => {
    if (disabled) return;
    
    document.execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
    editorRef.current?.focus();
    handleContentChange();
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, just insert a placeholder for file attachments
    const fileName = file.name;
    const fileHtml = `<span style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; margin: 2px; display: inline-block;">📎 ${fileName}</span>`;
    
    document.execCommand('insertHTML', false, fileHtml);
    handleContentChange();
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Insert emoji (simplified)
  const insertEmoji = (emoji: string) => {
    document.execCommand('insertText', false, emoji);
    handleContentChange();
  };

  // Popular emojis
  const popularEmojis = ["😊", "😂", "❤️", "👍", "🙏", "💪", "🎉", "✨", "🔥", "💯"];

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-1 flex-wrap">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => toggleFormat('bold')}
            disabled={disabled}
            className={`p-2 rounded hover:bg-gray-200 ${format.bold ? 'bg-gray-200 text-blue-600' : 'text-gray-600'} disabled:opacity-50`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => toggleFormat('italic')}
            disabled={disabled}
            className={`p-2 rounded hover:bg-gray-200 ${format.italic ? 'bg-gray-200 text-blue-600' : 'text-gray-600'} disabled:opacity-50`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => toggleFormat('underline')}
            disabled={disabled}
            className={`p-2 rounded hover:bg-gray-200 ${format.underline ? 'bg-gray-200 text-blue-600' : 'text-gray-600'} disabled:opacity-50`}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => insertList(false)}
            disabled={disabled}
            className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertList(true)}
            disabled={disabled}
            className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Link */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => setShowLinkDialog(true)}
            disabled={disabled}
            className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"
            title="Insert Link"
          >
            <Link className="w-4 h-4" />
          </button>
        </div>

        {/* Attachments */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"
            title="Attach File"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
        </div>

        {/* Emojis */}
        <div className="flex items-center gap-1">
          <div className="relative group">
            <button
              type="button"
              disabled={disabled}
              className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"
              title="Insert Emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
            <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 hidden group-hover:block z-10">
              <div className="grid grid-cols-5 gap-1">
                {popularEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="p-1 hover:bg-gray-100 rounded text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Send Button */}
        {showSendButton && (
          <div className="ml-auto">
            <button
              type="button"
              onClick={onSend}
              disabled={disabled || !value.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              title="Send (Ctrl+Enter)"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleContentChange}
        onKeyUp={updateFormatState}
        onMouseUp={updateFormatState}
        className={`p-4 min-h-[120px] max-h-[300px] overflow-y-auto focus:outline-none text-black ${
          disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
        }`}
        style={{ 
          lineHeight: '1.5',
          wordBreak: 'break-word',
          color: '#000000'
        }}
        data-placeholder={placeholder}
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter link text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={insertLink}
                disabled={!linkUrl || !linkText}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Insert Link
              </button>
              <button
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl("");
                  setLinkText("");
                }}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state placeholder */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
        }
        [contenteditable] * {
          color: #000000 !important;
        }
        [contenteditable] {
          color: #000000 !important;
        }
      `}</style>
    </div>
  );
}
