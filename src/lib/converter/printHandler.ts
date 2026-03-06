/**
 * printHandler.ts
 * Orchestrator that opens a popup window and writes the converted HTML.
 *
 * Ported from html2pdf_converter v8 — go() function structure.
 * Calls the appropriate layout handler based on detected layout type,
 * then writes the result into a popup via document.write().
 */

import type { LayoutType } from "./detectLayout";
import { buildSlideHtml } from "./slideHandler";
import { buildPageHtml } from "./pageHandler";
import { buildTabHtml } from "./tabHandler";

/**
 * Open a popup window, build the layout-specific HTML, and write it.
 *
 * @param htmlContent - The raw HTML string of the uploaded file
 * @param layoutType  - The detected layout type ("slide" | "page" | "tab" | "unknown")
 * @returns true if the popup was opened and HTML was written successfully,
 *          false if the popup was blocked
 */
export function executePrint(
  htmlContent: string,
  layoutType: LayoutType
): boolean {
  // Open popup window
  const pw = window.open("", "_blank");
  if (!pw) {
    return false;
  }

  // Build the appropriate HTML based on layout type
  let html: string;

  switch (layoutType) {
    case "tab":
      html = buildTabHtml(htmlContent);
      break;
    case "page":
      html = buildPageHtml(htmlContent);
      break;
    case "slide":
      html = buildSlideHtml(htmlContent);
      break;
    case "unknown":
    default:
      // For unknown layouts, fall back to slide handler
      // (matches original go() behavior where slide is the default path)
      html = buildSlideHtml(htmlContent);
      break;
  }

  // Write HTML to popup
  pw.document.write(html);
  pw.document.close();

  return true;
}
