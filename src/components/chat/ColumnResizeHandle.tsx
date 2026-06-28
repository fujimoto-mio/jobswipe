"use client";

type ColumnResizeHandleProps = {
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  className?: string;
};

export default function ColumnResizeHandle({ onPointerDown, className = "" }: ColumnResizeHandleProps) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="列幅を調整"
      onPointerDown={onPointerDown}
      className={`chat-column-resize-handle ${className}`.trim()}
    />
  );
}
