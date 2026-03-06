/**
 * detectLayout.ts
 * Ported from html2pdf_converter v8 — go() lines 66-68, hf() line 58
 *
 * Detects the layout type of an HTML document:
 *   - "slide" : class="slide" present
 *   - "tab"   : class="sp" + data-main= present (SPA architecture docs)
 *   - "page"  : class="page" present (and NOT tab layout)
 *   - "unknown": none of the above
 */

export type LayoutType = "slide" | "page" | "tab" | "unknown";

export interface LayoutInfo {
  type: LayoutType;
  count: number;
  label: string;
}

/**
 * Detect layout type and element count from raw HTML string.
 *
 * Detection priority (matches original go() logic):
 *   1. isTabLayout = /class="sp"/ && /data-main=/
 *   2. isPageLayout = /class="page"/ && !isTabLayout
 *   3. isSlideLayout = /class="slide"/
 *      - if isPageLayout && !isSlideLayout => "page"
 *      - else => "slide"
 *   4. none => "unknown"
 *
 * Count / label logic from hf():
 *   slides  -> data-idx="  matches
 *   pages   -> data-page=" matches
 *   tabs    -> class="sp"  matches (with trailing space or quote)
 */
export function detectLayout(htmlContent: string): LayoutInfo {
  // ── layout flags (from go() lines 66-68) ──
  const isSlideLayout = /class="slide"/.test(htmlContent);
  const isTabLayout =
    /class="sp"/.test(htmlContent) && /data-main=/.test(htmlContent);
  const isPageLayout = /class="page"/.test(htmlContent) && !isTabLayout;

  // ── count / label (from hf() line 58) ──
  const slideCount = (htmlContent.match(/data-idx="/g) || []).length;
  const pageCount = (htmlContent.match(/data-page="/g) || []).length;
  const tabCount = (htmlContent.match(/class="sp[\s"]/g) || []).length;

  // ── resolve type (mirrors go() branching order) ──
  if (isTabLayout) {
    return {
      type: "tab",
      count: tabCount || 1,
      label: "\uc139\uc158", // 섹션
    };
  }

  if (isPageLayout && !isSlideLayout) {
    return {
      type: "page",
      count: pageCount || 1,
      label: "\ud398\uc774\uc9c0", // 페이지
    };
  }

  if (isSlideLayout) {
    return {
      type: "slide",
      count: slideCount || 1,
      label: "\uc2ac\ub77c\uc774\ub4dc", // 슬라이드
    };
  }

  return {
    type: "unknown",
    count: 1,
    label: "\ubb38\uc11c", // 문서
  };
}
