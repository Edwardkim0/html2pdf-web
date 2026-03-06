"use client";

interface ConvertButtonProps {
  onClick: () => void;
}

export default function ConvertButton({ onClick }: ConvertButtonProps) {
  return (
    <button className="btn-convert" onClick={onClick} type="button">
      <span className="btn-icon">🖨</span>
      PDF로 변환
    </button>
  );
}
