import React, { useState, useRef, useCallback } from "react";
import { PaperPlaneTilt, Image as ImageIcon, X, FileText, Paperclip } from "@phosphor-icons/react";

export const ChatInput = ({ onSendMessage, onSend, isLoading, disabled, placeholder = "Nhập tin nhắn của bạn..." }) => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const handleSend = onSendMessage || onSend;
  const isBlocked = isLoading || disabled;

  // Convert File to Base64 data URL
  const readFileAsDataURL = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target.result,
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const parsed = await Promise.all(selectedFiles.map(readFileAsDataURL));
    setFiles((prev) => [...prev, ...parsed]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Clipboard Paste (e.g. Ctrl + V screenshot)
  const handlePaste = useCallback(async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const pastedFiles = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) pastedFiles.push(file);
      }
    }

    if (pastedFiles.length > 0) {
      e.preventDefault();
      const parsed = await Promise.all(pastedFiles.map(readFileAsDataURL));
      setFiles((prev) => [...prev, ...parsed]);
    }
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if ((!text.trim() && files.length === 0) || isBlocked) return;

    if (typeof handleSend === "function") {
      const imagesPayload = files.map((f) => f.data);
      handleSend(text.trim(), imagesPayload);
      setText("");
      setFiles([]);
    }
  };

  return (
    <div className="p-3 bg-white border-t border-slate-100 shrink-0">
      {/* File Previews Bar */}
      {files.length > 0 && (
        <div className="flex items-center gap-2 mb-2 px-1 overflow-x-auto pb-1">
          {files.map((file, idx) => (
            <div key={idx} className="relative group shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-2xs">
              {file.type.startsWith("image/") ? (
                <img src={file.data} alt={file.name} className="w-14 h-14 object-cover" />
              ) : (
                <div className="w-14 h-14 flex flex-col items-center justify-center p-1 text-slate-500">
                  <FileText size={20} weight="fill" className="text-blue-500" />
                  <span className="text-[9px] truncate max-w-full">{file.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(idx)}
                title="Xóa file"
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer"
              >
                <X size={10} weight="bold" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center w-full px-0.5">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={isBlocked}
        />

        {/* Unified Capsule Control */}
        <div
          className="flex-1 flex items-center gap-2 bg-[#f4f8ff] hover:bg-[#edf4ff] focus-within:bg-white px-2 py-1.5 transition-all duration-200 shadow-2xs"
          style={{ borderRadius: 9999, border: "1px solid #d5e6fc" }}
        >
          {/* Left paperclip button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBlocked}
            title="Đính kèm ảnh hoặc tài liệu"
            className="w-8 h-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center cursor-pointer transition-colors shrink-0"
            style={{ borderRadius: 9999, border: "none", background: "transparent" }}
          >
            <Paperclip size={18} weight="bold" />
          </button>

          {/* Text input */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={handlePaste}
            placeholder={files.length > 0 ? "Thêm mô tả..." : placeholder}
            disabled={isBlocked}
            className="flex-1 bg-transparent text-[13px] font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-1 px-0.5 select-text"
          />

          {/* Send button on the right */}
          <button
            type="submit"
            disabled={(!text.trim() && files.length === 0) || isBlocked}
            aria-label="Gửi tin nhắn"
            className="w-8 h-8 disabled:opacity-35 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm shrink-0"
            style={{
              borderRadius: 9999,
              border: "none",
              background: "linear-gradient(135deg, #0b5ed7 0%, #1d75f2 100%)",
            }}
          >
            <PaperPlaneTilt size={14} weight="fill" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;