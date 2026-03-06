"use client";

interface FileCardProps {
  fileName: string;
  fileSize: number;
  layoutLabel: string;
  layoutCount: number;
  onRemove: () => void;
}

function formatSize(bytes: number): string {
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function FileCard({
  fileName,
  fileSize,
  layoutLabel,
  layoutCount,
  onRemove,
}: FileCardProps) {
  return (
    <div className="file-card">
      <span className="file-icon">📎</span>

      <div className="file-info">
        <div className="file-name" title={fileName}>
          {fileName}
        </div>
        <div className="file-meta">
          <span>{formatSize(fileSize)}</span>
          <span className="dot" />
          <span>
            {layoutLabel} ({layoutCount}
            {layoutCount === 1 ? "페이지" : "페이지"})
          </span>
        </div>
      </div>

      <button
        className="btn-remove"
        onClick={onRemove}
        aria-label="파일 제거"
        type="button"
      >
        ✕
      </button>
    </div>
  );
}
