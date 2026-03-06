/**
 * pageHandler.ts
 * Ported from html2pdf_converter v8 — goPageLayout() (lines 292-482)
 *
 * Handles .page-based document layouts (e.g. C-Level reports, glossaries).
 * Builds the complete modified HTML string ready for document.write().
 */

/**
 * Build the complete modified HTML for page-based layouts.
 *
 * 1. Replace class="page" to add "active" class
 * 2. Inject print CSS into <head>
 * 3. Inject trigger script before </body> (activate pages, hide sidebar,
 *    TOC generation, page scaling, print with fallback)
 */
export function buildPageHtml(htmlContent: string): string {
  let html = htmlContent;

  // ── 1) 모든 .page를 active + visible로 강제 ──
  html = html.replace(/class="page(\s|")/g, 'class="page active$1');

  // ── 2) 강력한 인쇄 CSS — 모든 레이아웃 오버라이드 ──
  const printCSS = '<style id="pdf-override">' +
    '*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important;animation:none!important;transition:none!important}' +
    '@page{size:A4 portrait;margin:12mm 16mm}' +
    'html,body{width:auto!important;height:auto!important;min-height:auto!important;max-height:none!important;overflow:visible!important;background:#fff!important;margin:0!important;padding:0!important;display:block!important}' +
    '.sidebar,#sidebar,nav,.mobile-header,.overlay,#overlay,.cover-start,.hamburger,.sidebar-footer{display:none!important}' +
    '.app,[class*="app"]{display:block!important;min-height:auto!important;height:auto!important}' +
    '.main,#main,[class*="main"]{margin-left:0!important;padding:0!important;max-width:100%!important;width:100%!important;height:auto!important;min-height:auto!important;overflow:visible!important;flex:none!important}' +
    '.page{display:block!important;height:270mm!important;max-height:270mm!important;overflow:hidden!important;padding:32px 40px!important;max-width:100%!important;box-sizing:border-box!important}' +
    '.page~.page{page-break-before:always!important;break-before:page!important}' +
    '.cover-page{min-height:auto!important;height:auto!important;justify-content:flex-start!important;padding-top:40px!important}' +
    '.term-card,.callout,.example-box,.compare-box,.compare-grid,.def-table-wrap,.flow-strip,.summary-card,.template-box,.table-wrap,.mono-block,.slack-mock,.vs-grid,.spectrum{page-break-inside:avoid!important;break-inside:avoid!important}' +
    'h2,h3,h4{page-break-after:avoid!important}' +
    '.compare-grid,.vs-grid{grid-template-columns:1fr 1fr!important}' +
    '.summary-grid{grid-template-columns:1fr 1fr!important}' +
    '.mono-block{background:#1e1e1e!important;color:#d4d4d4!important}' +
    '.mono-block .comment{color:#6a9955!important}' +
    '.mono-block .hl{color:#dcdcaa!important}' +
    '.mono-block .ac{color:#ce9178!important}' +
    '.mono-block .kw{color:#569cd6!important}' +
    '.spectrum{background:#f5f5f3!important}' +
    '.spectrum-bar div{color:#fff!important}' +
    '.callout{background:#fafaf8!important;border-left:3px solid #c43b2a!important}' +
    '.callout.blue{background:#d2dfe8!important;border-left-color:#2a5c8a!important}' +
    '.callout.green{background:#d2e8d9!important;border-left-color:#2a7a4a!important}' +
    '.callout.amber{background:#e8dfd2!important;border-left-color:#8a6a2a!important}' +
    '.slack-mock{background:#fff!important;border:1px solid #ddd!important}' +
    '.slack-goal{background:#d2dfe8!important;color:#2a5c8a!important}' +
    '.vs-col.bad{background:#fef5f5!important}' +
    '.vs-col.good{background:#f5fef8!important}' +
    '.vs-col.bad .vs-label{color:#c43b2a!important}' +
    '.vs-col.good .vs-label{color:#2a7a4a!important}' +
    '.summary-card{background:#fafaf8!important;border:1px solid #e0ddd8!important}' +
    '.page-label{color:#c43b2a!important}' +
    'th{background:#f5f5f3!important}' +
    // TOC 페이지 스타일
    '.toc-page{display:block!important;padding:48px 40px!important}' +
    '.toc-row{display:flex;align-items:baseline;gap:14px;padding:13px 0;border-bottom:1px solid #e0ddd8}' +
    '.toc-num{font-family:monospace;font-size:12px;color:#c43b2a;min-width:28px;text-align:right}' +
    '.toc-label{font-size:15px;color:#1a1a1a}' +
    '.toc-group{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#888;margin-top:24px;margin-bottom:4px;font-weight:600}' +
  '</style>';

  const headEnd = html.indexOf('</head>');
  if (headEnd !== -1) {
    html = html.substring(0, headEnd) + printCSS + html.substring(headEnd);
  } else {
    html = printCSS + html;
  }

  // ── 3) 인쇄 트리거 + TOC 생성 ──
  const triggerScript = '<scr' + 'ipt>setTimeout(function(){' +
    // 모든 페이지 강제 표시
    'document.querySelectorAll(".page").forEach(function(p){p.classList.add("active");p.style.display="block";});' +
    // 사이드바·모바일헤더·오버레이 숨김
    'var sb=document.querySelector(".sidebar")||document.getElementById("sidebar");if(sb)sb.style.display="none";' +
    'var mh=document.querySelector(".mobile-header");if(mh)mh.style.display="none";' +
    'var ov=document.querySelector(".overlay")||document.getElementById("overlay");if(ov)ov.style.display="none";' +
    // body/html 레이아웃 강제 해제
    'document.documentElement.style.cssText="height:auto!important;overflow:visible!important;display:block!important";' +
    'document.body.style.cssText+="height:auto!important;overflow:visible!important;display:block!important";' +
    // main 해제
    'var mn=document.querySelector(".main")||document.getElementById("main");if(mn){mn.style.height="auto";mn.style.overflow="visible";mn.style.marginLeft="0";}' +
    // 색상 인라인
    'document.querySelectorAll(".callout,.term-card,.example-box,.compare-box,.summary-card,.mono-block,.slack-mock,.vs-col,.spectrum,.spectrum-bar div,.page-label,.vs-label,.slack-goal").forEach(function(el){' +
    'var s=getComputedStyle(el);' +
    'if(s.backgroundColor&&s.backgroundColor!="rgba(0, 0, 0, 0)")el.style.backgroundColor=s.backgroundColor;' +
    'if(s.borderLeftColor)el.style.borderLeftColor=s.borderLeftColor;' +
    'if(s.color)el.style.color=s.color;' +
    '});' +

    // ───── TOC 페이지 생성 ─────
    '(function(){' +
    'var entries=[];' +
    // C-Level 스타일: .nav-item (JS로 동적 생성된 것)
    'var ni=document.querySelectorAll(".nav-item");' +
    'if(ni.length>0){' +
      'ni.forEach(function(item,i){' +
        'if(i===0)return;' +
        'var ne=item.querySelector(".nav-num");' +
        'var num=ne?ne.textContent.trim():"\\u2014";' +
        'var lbl=item.textContent.trim();' +
        'if(ne)lbl=lbl.replace(num,"").trim();' +
        'entries.push({n:num,t:lbl});' +
      '});' +
    '}' +
    // 용어사전 스타일: .sidebar-group + .sidebar-item
    'if(entries.length===0){' +
      'var gs=document.querySelectorAll(".sidebar-group");' +
      'if(gs.length>0){' +
        'gs.forEach(function(g){' +
          'var gl=g.querySelector(".sidebar-group-label");' +
          'if(gl)entries.push({n:"",t:gl.textContent.trim(),g:1});' +
          'g.querySelectorAll(".sidebar-item").forEach(function(si){' +
            'entries.push({n:"\\u00B7",t:si.textContent.trim()});' +
          '});' +
        '});' +
      '}else{' +
        'document.querySelectorAll(".sidebar-item").forEach(function(si){' +
          'entries.push({n:"\\u00B7",t:si.textContent.trim()});' +
        '});' +
      '}' +
    '}' +
    // TOC DOM 생성
    'if(entries.length>0){' +
      'var tp=document.createElement("div");' +
      'tp.className="page active toc-page";' +
      // page-label
      'var pl=document.createElement("div");' +
      'pl.className="page-label";' +
      'pl.textContent="Contents";' +
      'pl.style.color="#c43b2a";' +
      'tp.appendChild(pl);' +
      // h2 목차
      'var h2=document.createElement("h2");' +
      'h2.textContent="\\ubaa9\\ucc28";' +
      'h2.style.cssText="font-family:serif;font-size:28px;font-weight:700;line-height:1.35;margin-bottom:32px";' +
      'tp.appendChild(h2);' +
      // 항목 리스트
      'var list=document.createElement("div");' +
      'entries.forEach(function(e){' +
        'var row=document.createElement("div");' +
        'if(e.g){' +
          'row.className="toc-group";' +
          'row.textContent=e.t;' +
        '}else{' +
          'row.className="toc-row";' +
          'var ns=document.createElement("span");' +
          'ns.className="toc-num";' +
          'ns.textContent=e.n;' +
          'row.appendChild(ns);' +
          'var ts=document.createElement("span");' +
          'ts.className="toc-label";' +
          'ts.textContent=e.t;' +
          'row.appendChild(ts);' +
        '}' +
        'list.appendChild(row);' +
      '});' +
      'tp.appendChild(list);' +
      // 표지(첫 .page) 바로 뒤에 삽입
      'var fp=document.querySelector(".page");' +
      'if(fp&&fp.parentNode){' +
        'fp.parentNode.insertBefore(tp,fp.nextSibling);' +
      '}' +
    '}' +
    '})();' +

    // ───── 페이지 스케일링 (A4 1페이지에 맞추기) ─────
    '(function(){' +
    'var pageMM=270;' +
    'var pagePx=pageMM*(96/25.4);' +
    'var pad=64;' +
    'var usable=pagePx-pad;' +
    'document.querySelectorAll(".page").forEach(function(p){' +
      'if(p.classList.contains("toc-page"))return;' +
      'var w=document.createElement("div");' +
      'w.style.cssText="transform-origin:top left;width:100%";' +
      'while(p.firstChild)w.appendChild(p.firstChild);' +
      'p.appendChild(w);' +
      'var ch=w.scrollHeight;' +
      'if(ch>usable){' +
        'var sc=Math.max(usable/ch,0.5);' +
        'w.style.transform="scale("+sc+")";' +
        'w.style.width=(100/sc)+"%";' +
      '}' +
    '});' +
    '})();' +

    // 인쇄 (fonts.ready + 절대 fallback)
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
