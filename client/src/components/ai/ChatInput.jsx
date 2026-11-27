import React, { useState, useRef, useCallback } from "react";
import { PaperPlaneTilt, X, FileText, Paperclip } from "@phosphor-icons/react";

export const ChatInput = ({
  onSendMessage,
  onSend,
  isLoading,
  disabled,
  placeholder = "Ask me anything about travel...",
}) => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const handleSend = onSendMessage || onSend;
  const isBlocked = isLoading || disabled;

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

  const canSend = (text.trim().length > 0 || files.length > 0) && !isBlocked;

  return (
    <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3">
      {/* File Previews Bar */}
      {files.length > 0 && (
        <div className="mb-2 flex items-center gap-2 overflow-x-auto px-1 pb-1">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="group relative shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xs"
            >
              {file.type.startsWith("image/") ? (
                <img src={file.data} alt={file.name} className="h-14 w-14 object-cover" />
              ) : (
                <div className="flex h-14 w-14 flex-col items-center justify-center p-1 text-slate-500">
                  <FileText size={20} weight="fill" className="text-blue-500" />
                  <span className="max-w-full truncate text-[9px]">{file.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(idx)}
                title="Xóa file"
                className="absolute right-0.5 top-0.5 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-slate-900/80 text-[10px] text-white transition-colors hover:bg-rose-600"
              >
                <X size={10} weight="bold" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={isBlocked}
        />

        {/* TripGenie Glowing Gradient Border Input Wrapper */}
        <div
          className="p-[1.5px] shadow-xs transition-shadow focus-within:shadow-md"
          style={{
            borderRadius: 14,
            background: "linear-gradient(90deg, #38bdf8 0%, #6366f1 55%, #8b5cf6 100%)",
          }}
        >
          <div
            className="flex items-center gap-2 bg-white px-2.5 py-2"
            style={{ borderRadius: 12.5 }}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBlocked}
              title="Đính kèm ảnh hoặc PDF"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-[#2563eb] disabled:opacity-40"
              style={{ border: "none", background: "transparent" }}
            >
              <Paperclip size={18} weight="bold" />
            </button>

            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onPaste={handlePaste}
              disabled={isBlocked}
              placeholder={placeholder}
              className="min-w-0 flex-1 bg-transparent text-[13.5px] font-medium text-[#091e47] outline-none placeholder:text-slate-400"
              style={{ border: "none" }}
            />

            <button
              type="submit"
              disabled={!canSend}
              title="Gửi tin nhắn"
              aria-label="Gửi tin nhắn"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition hover:brightness-105 disabled:cursor-not-allowed"
              style={{
                border: "none",
                background: canSend
                  ? "linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)"
                  : "#cbd5e1",
              }}
            >
              <PaperPlaneTilt size={15} weight="fill" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
