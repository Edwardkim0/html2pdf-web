"use client";

export default function HowToGuide() {
  return (
    <div className="how-to">
      <h3>인쇄 설정 가이드</h3>

      <div className="step">
        <span className="step-number">1</span>
        <span className="step-text">
          인쇄 대화상자에서 <strong>대상</strong>을{" "}
          <strong>&quot;PDF로 저장&quot;</strong>으로 선택하세요.
        </span>
      </div>

      <div className="step">
        <span className="step-number">2</span>
        <span className="step-text">
          <strong>여백</strong>을 <strong>&quot;없음&quot;</strong>으로,{" "}
          <strong>배율</strong>을 <strong>&quot;기본값&quot;</strong>으로
          설정하세요.
        </span>
      </div>

      <div className="step">
        <span className="step-number">3</span>
        <span className="step-text">
          <strong>배경 그래픽</strong> 옵션을 반드시{" "}
          <strong>체크(활성화)</strong>한 뒤 저장하세요.
        </span>
      </div>
    </div>
  );
}
