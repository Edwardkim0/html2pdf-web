"use client";

import { useState, useCallback } from "react";
import { detectLayout, type LayoutInfo } from "@/lib/converter/detectLayout";
import { executePrint } from "@/lib/converter/printHandler";
import DropZone from "./DropZone";
import FileCard from "./FileCard";
import ConvertButton from "./ConvertButton";
import HowToGuide from "./HowToGuide";
import "./converter.css";

type Phase = "idle" | "ready" | "converted";

export default function ConverterApp() {
  const [file, setFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [layoutInfo, setLayoutInfo] = useState<LayoutInfo | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  // ── File Selection ──
  const handleFileSelect = useCallback((selectedFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const layout = detectLayout(content);

      setFile(selectedFile);
      setHtmlContent(content);
      setLayoutInfo(layout);
      setPhase("ready");
    };
    reader.readAsText(selectedFile);
  }, []);

  // ── Remove File ──
  const handleRemove = useCallback(() => {
    setFile(null);
    setHtmlContent("");
    setLayoutInfo(null);
    setPhase("idle");
  }, []);

  // ── Convert (Print) ──
  const handleConvert = useCallback(() => {
    if (!htmlContent) return;

    executePrint(htmlContent, layoutInfo?.type ?? "unknown");
    setPhase("converted");

    // Fire-and-forget: log the conversion
    try {
      fetch("/api/conversions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file?.name ?? "unknown.html",
          sizeBytes: file?.size ?? 0,
          layoutType: layoutInfo?.type ?? "unknown",
        }),
      }).catch(() => {
        // Silently ignore tracking errors
      });
    } catch {
      // Silently ignore
    }
  }, [htmlContent, file, layoutInfo]);

  // ── Reset ──
  const handleReset = useCallback(() => {
    setFile(null);
    setHtmlContent("");
    setLayoutInfo(null);
    setPhase("idle");
  }, []);

  return (
    <div className="converter-root">
      <div className="app">
        {/* Header */}
        <div className="header">
          <h1>HTML → PDF 변환기</h1>
          <p>HTML 파일을 브라우저 인쇄 기능으로 PDF로 변환합니다</p>
        </div>

        {/* Phase: idle — show drop zone */}
        {phase === "idle" && <DropZone onFileSelect={handleFileSelect} />}

        {/* Phase: ready — show file card, convert button, guide */}
        {phase === "ready" && file && layoutInfo && (
          <>
            <FileCard
              fileName={file.name}
              fileSize={file.size}
              layoutLabel={layoutInfo.label}
              layoutCount={layoutInfo.count}
              onRemove={handleRemove}
            />
            <ConvertButton onClick={handleConvert} />
            <HowToGuide />
          </>
        )}

        {/* Phase: converted — show success + reset */}
        {phase === "converted" && (
          <>
            <div className="converted-message">
              <span className="check-icon">✅</span>
              <h2>변환이 완료되었습니다</h2>
              <p>인쇄 대화상자에서 PDF로 저장해주세요</p>
            </div>
            <button
              className="btn-reset"
              onClick={handleReset}
              type="button"
            >
              다른 파일 변환하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
