"use client";

import { useEffect, useState, useCallback } from "react";
import { detectLayout } from "@/lib/converter/detectLayout";
import { executePrint } from "@/lib/converter/printHandler";

interface Document {
  id: number;
  filename: string;
  sizeBytes: number;
  layoutType: string;
  blobUrl: string;
  uploadedAt: string;
  conversionCount: number;
}

interface DocumentsResponse {
  data: Document[];
  total: number;
  page: number;
  totalPages: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const layoutBadge: Record<string, { bg: string; text: string; label: string }> = {
  slide: { bg: "bg-blue-100", text: "text-blue-700", label: "Slide" },
  page: { bg: "bg-green-100", text: "text-green-700", label: "Page" },
  tab: { bg: "bg-purple-100", text: "text-purple-700", label: "Tab" },
  unknown: { bg: "bg-gray-100", text: "text-gray-600", label: "Unknown" },
};

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [converting, setConverting] = useState<number | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/documents?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: DocumentsResponse = await res.json();
      setDocuments(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      setError("문서 목록을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDocuments();
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`"${doc.filename}" 문서를 삭제하시겠습니까?`)) return;

    setDeleting(doc.id);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchDocuments();
    } catch {
      alert("삭제에 실패했습니다.");
    } finally {
      setDeleting(null);
    }
  };

  // HTML 파일 다운로드
  const handleDownloadHtml = (doc: Document) => {
    const link = document.createElement("a");
    link.href = `/api/documents/${doc.id}/download`;
    link.download = doc.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF 변환 (브라우저 인쇄)
  const handleConvertPdf = async (doc: Document) => {
    setConverting(doc.id);
    try {
      const res = await fetch(`/api/documents/${doc.id}/download?format=content`);
      if (!res.ok) throw new Error("Failed to fetch content");
      const { content, layoutType } = await res.json();

      // 변환 로직 실행 (브라우저 인쇄 대화상자)
      const layout = detectLayout(content);
      executePrint(content, layout.type);
    } catch {
      alert("PDF 변환에 실패했습니다.");
    } finally {
      setConverting(null);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError("");
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      setUploadError("파일을 선택해주세요.");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      setShowUploadModal(false);
      setPage(1);
      fetchDocuments();
    } catch {
      setUploadError("업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">문서 관리</h1>
          <p className="text-sm text-gray-500 mt-1">
            총 {total}개의 문서
          </p>
        </div>
        <button
          onClick={() => {
            setUploadError("");
            setShowUploadModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          업로드
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="파일명으로 검색..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          검색
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center text-gray-400 text-sm">
            불러오는 중...
          </div>
        ) : error ? (
          <div className="px-6 py-16 text-center text-red-500 text-sm">
            {error}
          </div>
        ) : documents.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400 text-sm">
            {search ? "검색 결과가 없습니다" : "문서가 없습니다"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    파일명
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    크기
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    레이아웃
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    변환횟수
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    업로드일
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {documents.map((doc) => {
                  const badge = layoutBadge[doc.layoutType] || layoutBadge.unknown;
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 text-gray-900 font-medium">
                        <div className="max-w-xs truncate">{doc.filename}</div>
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">
                        {formatFileSize(doc.sizeBytes)}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">
                        {doc.conversionCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">
                        {formatDate(doc.uploadedAt)}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {/* HTML 다운로드 */}
                          <button
                            onClick={() => handleDownloadHtml(doc)}
                            title="HTML 다운로드"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            HTML
                          </button>
                          {/* PDF 변환 */}
                          <button
                            onClick={() => handleConvertPdf(doc)}
                            disabled={converting === doc.id}
                            title="PDF로 변환"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-orange-600 border border-orange-200 rounded-md hover:bg-orange-50 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            {converting === doc.id ? "변환중..." : "PDF"}
                          </button>
                          {/* 삭제 */}
                          <button
                            onClick={() => handleDelete(doc)}
                            disabled={deleting === doc.id}
                            title="삭제"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {deleting === doc.id ? "삭제중..." : "삭제"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              총 {total}개 중 {(page - 1) * 20 + 1}-{Math.min(page * 20, total)}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                이전
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  // Show first, last, and pages around current
                  return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                })
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) {
                    acc.push("...");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer ${
                        page === p
                          ? "bg-orange-500 text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !uploading && setShowUploadModal(false)}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">문서 업로드</h3>
              <button
                onClick={() => !uploading && setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {uploadError && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">
                  {uploadError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTML 파일 선택
                </label>
                <input
                  type="file"
                  name="file"
                  accept=".html,.htm"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 file:cursor-pointer cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  .html 또는 .htm 파일만 업로드 가능합니다
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !uploading && setShowUploadModal(false)}
                  disabled={uploading}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  {uploading ? "업로드 중..." : "업로드"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
