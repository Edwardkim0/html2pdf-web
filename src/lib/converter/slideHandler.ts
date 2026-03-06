/**
 * slideHandler.ts
 * Ported from html2pdf_converter v8 — buildSlideScript() (lines 86-268)
 * and slide-path of go() (lines 270-287)
 *
 * Builds a complete modified HTML string ready for document.write() in a
 * popup window. Adds @page style into <head> and the print-trigger script
 * before </body>.
 */

/**
 * Build the print-trigger script that is injected before </body>.
 * Faithfully ported from buildSlideScript() lines 86-268.
 */
function buildSlideScript(): string {
  return `
<script>
setTimeout(function(){

    // STEP 1: UI 제거
    [".logo-bar",".nav-bar",".hint",".click-zone",".mobile-header",".overlay",".cover-start"].forEach(function(s){
      document.querySelectorAll(s).forEach(function(e){e.remove();});
    });

    // STEP 2: 차트 fallback
    var be = document.getElementById("bars");
    if(be && be.children.length === 0){
      [{d:"1/2",v:9},{d:"1/5",v:1},{d:"1/6",v:4},{d:"1/7",v:6},{d:"1/8",v:11},{d:"1/9",v:16},{d:"1/12",v:9},{d:"1/13",v:8},{d:"1/14",v:13},{d:"1/15",v:6},{d:"1/16",v:12},{d:"1/19",v:17},{d:"1/20",v:11},{d:"1/21",v:8},{d:"1/22",v:8},{d:"1/23",v:5},{d:"1/26",v:6},{d:"1/27",v:8},{d:"1/28",v:11},{d:"1/29",v:10},{d:"1/30",v:19}].forEach(function(d){
        var c=document.createElement("div");c.className="b-col";
        var n=document.createElement("div");n.className="b-num en";n.textContent=d.v;
        var b=document.createElement("div");b.className="b-bar"+(d.v>=16?" hot":"");b.style.height=(d.v/19*140)+"px";
        var t=document.createElement("div");t.className="b-date";t.textContent=d.d;
        c.appendChild(n);c.appendChild(b);c.appendChild(t);be.appendChild(c);
      });
    }

    // STEP 3: 모든 슬라이드 활성화
    document.querySelectorAll(".slide").forEach(function(s){
      s.classList.add("active");
      s.classList.remove("exit");
    });

    // STEP 4: deck 해체
    var deck = document.querySelector(".deck");
    var slides = document.querySelectorAll(".slide");
    if(deck){
      var parent = deck.parentNode;
      slides.forEach(function(s){ parent.insertBefore(s, deck); });
      deck.remove();
    }

    // STEP 5: 색상 인라인 강제
    document.querySelectorAll(".hl").forEach(function(el){
      el.style.webkitTextFillColor = "#2B5BFC";
      el.style.background = "none";
      el.style.color = "#2B5BFC";
    });
    document.querySelectorAll(".b-bar").forEach(function(b){
      b.style.backgroundColor = b.classList.contains("hot") ? "#F04848" : "#2B5BFC";
    });
    document.querySelectorAll(".kpi-val").forEach(function(v,i){
      v.style.color=["#2B5BFC","#00B893","#F5A623","#F04848"][i%4];
    });
    document.querySelectorAll(".cat-cnt").forEach(function(v,i){
      v.style.color=["#2B5BFC","#00B893","#F5A623","#F04848","#7B5CFF","#6B7084"][i%6];
    });
    document.querySelectorAll(".kpi-card,.cat-card,.pain-card,.chart-box,.qa-card,.impact-card").forEach(function(c){
      var bg=getComputedStyle(c).backgroundColor;
      c.style.backgroundColor=(bg&&bg!=="rgba(0, 0, 0, 0)")?bg:"#F6F7F9";
    });
    document.querySelectorAll(".chart-avg-badge").forEach(function(b){
      b.style.backgroundColor="rgba(0,184,147,0.08)";b.style.color="#00B893";
    });
    document.querySelectorAll(".pain-icon").forEach(function(ic,i){
      ic.style.backgroundColor=["rgba(240,72,72,0.08)","rgba(245,166,35,0.08)","rgba(43,91,252,0.08)"][i%3];
    });
    document.querySelectorAll(".cat-icon").forEach(function(ic){
      var bg=getComputedStyle(ic).backgroundColor;
      if(bg&&bg!=="rgba(0, 0, 0, 0)")ic.style.backgroundColor=bg;
    });
    document.querySelectorAll(".kpi-card").forEach(function(c,i){
      var colors=["#2B5BFC","#00B893","#F5A623","#F04848"];
      c.style.position="relative";c.style.overflow="hidden";
      if(!c.querySelector("[data-tl]")){
        var t=document.createElement("div");t.setAttribute("data-tl","1");
        t.style.cssText="height:3px;position:absolute;top:0;left:0;right:0;background:"+colors[i%4];
        c.insertBefore(t,c.firstChild);
      }
    });
    document.querySelectorAll(".qa-tag.t-hr").forEach(function(t){t.style.backgroundColor="rgba(43,91,252,0.08)";t.style.color="#2B5BFC";});
    document.querySelectorAll(".qa-tag.t-bud").forEach(function(t){t.style.backgroundColor="rgba(0,184,147,0.08)";t.style.color="#00B893";});
    document.querySelectorAll(".qa-tag.t-con").forEach(function(t){t.style.backgroundColor="rgba(245,166,35,0.08)";t.style.color="#F5A623";});
    document.querySelectorAll(".qa-tag.t-etc").forEach(function(t){t.style.backgroundColor="rgba(240,72,72,0.08)";t.style.color="#F04848";});
    document.querySelectorAll(".qa-q").forEach(function(q){q.style.borderLeftColor="#2B5BFC";});
    document.querySelectorAll(".imp-arrow").forEach(function(a){a.style.color="#00B893";});
    document.querySelectorAll(".cta-card").forEach(function(c){
      c.style.background="linear-gradient(135deg, #2B5BFC 0%, #00B893 100%)";
    });
    document.querySelectorAll(".cover-badge").forEach(function(b){
      b.style.backgroundColor="rgba(43,91,252,0.08)";b.style.color="#2B5BFC";
    });
    document.querySelectorAll(".cover-badge .dot").forEach(function(d){d.style.backgroundColor="#00B893";});
    document.querySelectorAll(".cover-stat .num").forEach(function(n){n.style.color="#2B5BFC";});
    document.querySelectorAll(".sl").forEach(function(s){s.style.color="#2B5BFC";});
    document.querySelectorAll(".cat-ex").forEach(function(e){e.style.backgroundColor="#FFFFFF";});

    // STEP 6: 인쇄 CSS
    var printCSS = document.createElement("style");
    printCSS.textContent = [
      "*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important;animation:none!important;transition:none!important}",
      "@page{size:297mm 210mm;margin:0}",
      "html,body{width:297mm!important;height:auto!important;overflow:visible!important;background:#fff!important;margin:0!important;padding:0!important}",
      ".logo-bar,.nav-bar,.hint,.click-zone,.sidebar,.mobile-header,.overlay,.cover-start,nav,.nav-progress,.nav-counter,.nav-btns,.deck{display:none!important}",
      ".slide{display:flex!important;align-items:center!important;justify-content:center!important;position:relative!important;inset:auto!important;width:297mm!important;height:210mm!important;min-height:210mm!important;max-height:210mm!important;overflow:hidden!important;opacity:1!important;transform:none!important;padding:6mm 12mm!important;box-sizing:border-box!important;margin:0!important;page-break-inside:avoid!important;break-inside:avoid!important}",
      ".slide-inner{width:100%!important;max-width:100%!important;margin:0!important}",
      ".hl{-webkit-text-fill-color:#2B5BFC!important;background:none!important;color:#2B5BFC!important}",
      ".cover-badge{margin-bottom:28px!important}",
      ".cover-title{font-size:50px!important;margin-bottom:20px!important}",
      ".cover-sub{font-size:16px!important;line-height:1.7!important}",
      ".cover-stats{margin-top:36px!important;gap:36px!important}",
      ".cover-stat .num{font-size:40px!important}",
      ".cover-stat .label{font-size:13px!important}",
      ".challenge-grid{grid-template-columns:1fr 1fr!important;gap:36px!important}",
      ".st{font-size:30px!important;margin-bottom:14px!important}",
      ".sd{font-size:14px!important;line-height:1.7!important}",
      ".sl{font-size:10px!important;margin-bottom:10px!important}",
      ".pain-cards{gap:12px!important}",
      ".pain-card{padding:16px!important;gap:12px!important;border-radius:12px!important}",
      ".pain-card h4{font-size:13px!important}",
      ".pain-card p{font-size:11.5px!important;line-height:1.55!important}",
      ".pain-icon{width:36px!important;height:36px!important;min-width:36px!important;font-size:16px!important;border-radius:10px!important}",
      ".kpi-row{grid-template-columns:repeat(4,1fr)!important;gap:16px!important;margin-top:32px!important}",
      ".kpi-card{padding:28px 16px!important;border-radius:16px!important}",
      ".kpi-val{font-size:38px!important}",
      ".kpi-label{font-size:13px!important}",
      ".kpi-sub{font-size:11px!important}",
      ".chart-box{margin-top:24px!important;padding:24px!important;border-radius:16px!important}",
      ".chart-top{margin-bottom:20px!important}",
      ".chart-top h3{font-size:14px!important}",
      ".bars{height:160px!important;gap:3px!important}",
      ".b-num{font-size:9px!important;margin-bottom:3px!important}",
      ".b-date{font-size:8px!important;margin-top:4px!important}",
      ".b-bar{max-width:26px!important;border-radius:4px 4px 1px 1px!important}",
      ".cat-grid{grid-template-columns:repeat(3,1fr)!important;gap:12px!important;margin-top:24px!important}",
      ".cat-card{padding:18px!important;border-radius:12px!important}",
      ".cat-top{margin-bottom:10px!important}",
      ".cat-name{font-size:13px!important;margin-bottom:8px!important}",
      ".cat-ex{font-size:10.5px!important;padding:4px 8px!important;margin-bottom:2px!important;border-radius:4px!important;line-height:1.4!important}",
      ".cat-cnt{font-size:20px!important}",
      ".cat-icon{width:32px!important;height:32px!important;font-size:14px!important;border-radius:8px!important}",
      ".qa-grid{grid-template-columns:1fr 1fr!important;gap:14px!important;margin-top:24px!important}",
      ".qa-card{padding:18px!important;border-radius:12px!important}",
      ".qa-tag{font-size:10px!important;padding:2px 8px!important;margin-bottom:8px!important}",
      ".qa-q{font-size:13px!important;margin-bottom:10px!important;padding-left:10px!important;line-height:1.5!important;border-left-width:2px!important}",
      ".qa-a{font-size:11px!important;padding:10px!important;max-height:72px!important;line-height:1.6!important;border-radius:8px!important}",
      ".impact-row{grid-template-columns:repeat(3,1fr)!important;gap:18px!important;margin-top:32px!important}",
      ".impact-card{padding:28px 20px!important;border-radius:16px!important}",
      ".imp-before{font-size:13px!important}",
      ".imp-arrow{font-size:24px!important;margin:10px 0!important}",
      ".imp-after{font-size:16px!important}",
      ".imp-val{font-size:34px!important}",
      ".imp-desc{font-size:12px!important;margin-top:10px!important;line-height:1.6!important}",
      ".cta-center{text-align:center!important}",
      ".cta-card{padding:56px 44px!important;border-radius:24px!important}",
      ".cta-card h2{font-size:34px!important;line-height:1.35!important;margin-bottom:16px!important}",
      ".cta-card p{font-size:15px!important;line-height:1.7!important}",
      ".cta-footer{margin-top:32px!important;font-size:14px!important}"
    ].join("");
    document.head.appendChild(printCSS);

    // STEP 7: 스케일링
    setTimeout(function(){
      var usableH = 186 * (96 / 25.4);
      document.querySelectorAll(".slide").forEach(function(s){
        var inner = s.querySelector(".slide-inner");
        if(!inner) return;
        s.style.overflow = "visible";
        s.style.height = "auto";
        var contentH = inner.scrollHeight;
        s.style.overflow = "hidden";
        s.style.height = "210mm";
        if(contentH > usableH){
          var scale = Math.max(usableH / contentH, 0.5);
          inner.style.transform = "scale(" + scale + ")";
          inner.style.transformOrigin = "top center";
          inner.style.width = (100 / scale) + "%";
          inner.style.marginLeft = "-" + ((100/scale - 100) / 2) + "%";
        }
      });
      var printed=false;
      function doPrint(){if(printed)return;printed=true;setTimeout(function(){window.print();},400);}
      try{document.fonts.ready.then(function(){setTimeout(doPrint,500);});}catch(e){}
      setTimeout(doPrint,3000);
    }, 800);
}, 200);
` + '</scr' + 'ipt>';
}

/**
 * Build the complete modified HTML string for slide layout.
 * Ported from go() lines 270-287.
 *
 * 1. Inject @page style into <head>
 * 2. Inject print-trigger script before </body>
 */
export function buildSlideHtml(htmlContent: string): string {
  const printScript = buildSlideScript();

  let html = htmlContent;

  // @page 규칙을 <head>에 직접 삽입
  const pageStyle =
    '<style>@page{size:297mm 210mm;margin:0}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}</style>';
  const headIdx = html.indexOf('</head>');
  if (headIdx !== -1) {
    html = html.substring(0, headIdx) + pageStyle + html.substring(headIdx);
  } else {
    html = pageStyle + html;
  }

  // print script를 </body> 앞에 삽입
  const idx = html.lastIndexOf('</body>');
  html =
    idx !== -1
      ? html.substring(0, idx) + printScript + html.substring(idx)
      : html + printScript;

  return html;
}
