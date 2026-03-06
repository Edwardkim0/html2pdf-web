/**
 * tabHandler.ts
 * Ported from html2pdf_converter v8 — goTabLayout() (lines 487-566)
 *
 * Handles .sp-based SPA tab layouts (e.g. architecture documents).
 * Builds the complete modified HTML string ready for document.write().
 */

/**
 * Build the complete modified HTML for tab-based SPA layouts.
 *
 * 1. Replace class="sp" to add "active" class
 * 2. Inject print CSS (A4 portrait, 10mm/12mm margins) into <head>
 * 3. Inject trigger script before </body> (show all sections, hide nav,
 *    inline colors, print with fallback)
 */
export function buildTabHtml(htmlContent: string): string {
  let html = htmlContent;

  // ── 1) 모든 .sp를 active로 강제 ──
  html = html.replace(/class="sp(\s|")/g, 'class="sp active$1');

  // ── 2) 인쇄 CSS ──
  const printCSS = '<style id="pdf-override">' +
    '*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important;animation:none!important;transition:none!important}' +
    '@page{size:A4 portrait;margin:10mm 12mm}' +
    'html,body{width:auto!important;height:auto!important;overflow:visible!important;background:#fff!important;margin:0!important;padding:0!important}' +
    '.nav{display:none!important}' +
    '.page{max-width:100%!important;width:100%!important;padding:0 10px!important;margin:0!important}' +
    '.sp{display:block!important}' +
    '.sp~.sp{page-break-before:always!important;break-before:page!important}' +
    '.section,.detail,.arch-diagram,.canvas,.callout,.flow,.verdict,.evo-phase,.role-guide,.role-card{page-break-inside:avoid!important;break-inside:avoid!important}' +
    'h1,h2,h3,h4{page-break-after:avoid!important}' +
    '.flow{white-space:pre-wrap!important;overflow-x:hidden!important}' +
    '.arch-grid{min-height:auto!important}' +
    '.tbl{font-size:.78em!important}' +
    '.arch-diagram{padding:20px 16px!important}' +
  '</style>';

  const headEnd = html.indexOf('</head>');
  if (headEnd !== -1) {
    html = html.substring(0, headEnd) + printCSS + html.substring(headEnd);
  } else {
    html = printCSS + html;
  }

  // ── 3) 트리거 스크립트 ──
  const triggerScript = '<scr' + 'ipt>setTimeout(function(){' +
    // 모든 섹션 활성화
    'document.querySelectorAll(".sp").forEach(function(s){s.classList.add("active");s.style.display="block";});' +
    // 네비게이션 숨기기
    'var nav=document.querySelector(".nav");if(nav)nav.style.display="none";' +
    // body/html 레이아웃 강제 해제
    'document.documentElement.style.cssText="height:auto!important;overflow:visible!important";' +
    'document.body.style.cssText+="height:auto!important;overflow:visible!important";' +
    // 색상 인라인 — 주요 컴포넌트
    'document.querySelectorAll(".callout,.detail,.arch-layer,.arch-core,.dg,.verdict,.evo-phase,.canvas-label,.canvas-header,.canvas-content,.role-card,.tag-l,.core-badge,.arch-divider").forEach(function(el){' +
    'var s=getComputedStyle(el);' +
    'if(s.backgroundColor&&s.backgroundColor!="rgba(0, 0, 0, 0)")el.style.backgroundColor=s.backgroundColor;' +
    'if(s.borderColor&&s.borderColor!="rgba(0, 0, 0, 0)")el.style.borderColor=s.borderColor;' +
    'if(s.borderLeftColor&&s.borderLeftColor!="rgba(0, 0, 0, 0)")el.style.borderLeftColor=s.borderLeftColor;' +
    'if(s.color)el.style.color=s.color;' +
    '});' +
    // flow 코드 블록 내부 색상
    'document.querySelectorAll(".flow .h1,.flow .h2,.flow .h3,.flow .h4,.flow .hc,.flow .he,.flow .dim").forEach(function(el){' +
    'el.style.color=getComputedStyle(el).color;' +
    '});' +
    // 태그 색상
    'document.querySelectorAll(".tag-l1,.tag-l2,.tag-l3,.tag-l4,.tag-core,.tag-evo").forEach(function(el){' +
    'var s=getComputedStyle(el);el.style.backgroundColor=s.backgroundColor;el.style.color=s.color;' +
    '});' +
    // tbl th 색상
    'document.querySelectorAll(".tbl th").forEach(function(el){' +
    'var s=getComputedStyle(el);el.style.backgroundColor=s.backgroundColor;el.style.color=s.color;' +
    '});' +
    // arch-layer 내부 lnum 색상
    'document.querySelectorAll(".lnum,.arch-layer h4,.arch-core h4,.snum").forEach(function(el){' +
    'el.style.color=getComputedStyle(el).color;' +
    '});' +
    // 인쇄 with fallback
    'var printed=false;' +
    'function doPrint(){if(printed)return;printed=true;setTimeout(function(){window.print();},400);}' +
    'try{document.fonts.ready.then(function(){setTimeout(doPrint,500);});}catch(e){}' +
    'setTimeout(doPrint,3000);' +
    '},100);' + '</scr' + 'ipt>';

  const bodyEnd = html.lastIndexOf('</body>');
  if (bodyEnd !== -1) {
    html = html.substring(0, bodyEnd) + triggerScript + html.substring(bodyEnd);
  } else {
    html = html + triggerScript;
  }

  return html;
}
