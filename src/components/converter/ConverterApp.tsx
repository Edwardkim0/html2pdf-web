"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
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

    // Fire-and-forget: log the conversion + 파일 업로드
    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("filename", file?.name ?? "unknown.html");
      formData.append("sizeBytes", String(file?.size ?? 0));
      formData.append("layoutType", layoutInfo?.type ?? "unknown");

      fetch("/api/conversions", {
        method: "POST",
        body: formData,
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
      {/* Top Bar: Logo + Admin */}
      <div className="top-bar">
        <Image
          src="/logo-dfinite.png"
          alt="Dfinite"
          width={120}
          height={32}
          className="logo"
          priority
        />
        <Link href="/admin/login" className="btn-admin">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          관리자
        </Link>
      </div>

      <div className="app">
        {/* Header */}
        <div className="header">
          <h1>HTML → PDF 변환기</h1>
          <p>HTML 파일을 업로드하면 레이아웃을 자동 감지하여<br/>최적의 PDF로 변환합니다</p>
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

      {/* Footer */}
      <div className="footer">
        © {new Date().getFullYear()} Dfinite. All rights reserved.
      </div>
    </div>
  );
}
