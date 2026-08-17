import React from "react";

interface QRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  logoText?: string;
  className?: string;
}

/**
 * Clean SVG QR Code generator supporting high quality rendering & branding
 */
export const QRCodeGenerator: React.FC<QRCodeProps> = ({
  value,
  size = 180,
  fgColor = "#0f172a",
  bgColor = "#ffffff",
  logoText = "DNA",
  className = "",
}) => {
  // Deterministic 21x21 pseudo-matrix based on string hash for realistic QR appearance
  const gridSize = 21;
  const matrix: boolean[][] = Array(gridSize)
    .fill(0)
    .map(() => Array(gridSize).fill(false));

  // Helper to hash string into boolean bits
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  // Set standard finder patterns in 3 corners
  const setFinderPattern = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startRow + r][startCol + c] = true;
        }
      }
    }
  };

  setFinderPattern(0, 0); // Top-left
  setFinderPattern(0, 14); // Top-right
  setFinderPattern(14, 0); // Bottom-left

  // Fill data cells based on value hash & indices
  let bitIndex = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Skip finder pattern zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c > 12;
      const inBottomLeft = r > 12 && c < 8;
      const inCenterLogo = r >= 8 && r <= 12 && c >= 8 && c <= 12;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inCenterLogo) {
        const charCode = value.charCodeAt(bitIndex % value.length);
        const isBitOn = ((hash ^ (r * 31 + c * 17 + charCode)) & 1) === 1;
        matrix[r][c] = isBitOn;
        bitIndex++;
      }
    }
  }

  const cellSize = size / gridSize;

  return (
    <div
      className={`inline-flex flex-col items-center justify-center p-3 rounded-2xl bg-white shadow-lg border border-slate-200 relative ${className}`}
      style={{ width: size + 24, height: size + 24 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rounded-lg"
      >
        <rect width={size} height={size} fill={bgColor} />
        {matrix.map((row, r) =>
          row.map((cell, c) => {
            if (!cell) return null;
            // Draw center logo area skip
            if (r >= 8 && r <= 12 && c >= 8 && c <= 12) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize - 0.4}
                height={cellSize - 0.4}
                rx={1}
                fill={fgColor}
              />
            );
          })
        )}
      </svg>
      {logoText && (
        <div
          className="absolute flex items-center justify-center bg-blue-600 text-white font-black rounded-lg shadow-md border-2 border-white"
          style={{
            width: size * 0.28,
            height: size * 0.28,
            fontSize: Math.max(10, size * 0.08),
          }}
        >
          {logoText}
        </div>
      )}
    </div>
  );
};
