"use client";

import { useCallback, useRef, useState } from "react";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
}

const ALLOWED_EXTENSIONS = [".html", ".htm"];

function isValidFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export default function DropZone({ onFileSelect }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file && isValidFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && isValidFile(file)) {
        onFileSelect(file);
      }
      // Reset input so the same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onFileSelect]
  );

  return (
    <div
      className={`drop-zone${isDragOver ? " dragover" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
    >
      <span className="icon">📄</span>
      <div className="label">HTML 파일을 드래그하거나 클릭하세요</div>
      <div className="sub">.html, .htm 파일만 지원됩니다</div>

      <input
        ref={inputRef}
        type="file"
        accept=".html,.htm"
        onChange={handleInputChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
