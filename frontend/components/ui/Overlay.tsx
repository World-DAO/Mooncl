"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ...其余 import 与类型不变
export interface OverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  opacity?: number;
  withCornerGradient?: boolean;
  cornerPosition?: "tr" | "tl" | "br" | "bl";
  cornerGradient?: string;
  tintColor?: string;

  // 之前的顶部模糊带（可选保留）
  topGradient?: boolean;
  topHeight?: number;
  topTint?: string;
  topBlur?: "sm" | "md" | "none";
  topFadeStop?: number;

  /** 新增：顶部不透明度渐变（替代 blur 的做法） */
  alphaGradient?: boolean; // 开关（默认 false）
  alphaTop?: number; // 顶部的覆盖系数 0~1（与 tintColor 的 alpha 相乘），默认 0.4
  alphaStopPct?: number; // 在视口的多少高度处过渡到 100% 覆盖，默认 35%

  /** 左下 + 右上 两条对角遮罩开关 */
  diagonalCorners?: boolean; // 默认 false
  /** 对角遮罩的配色（不传就用你给的粉紫→蓝渐变） */
  diagonalGradient?: string;
  /** 从角到中心渐隐结束的位置（百分比 0~100，默认 45） */
  diagonalStopPct?: number;
  /** 对角遮罩整体不透明度（0~1，默认 1） */
  diagonalOpacity?: number;
}

export default function Overlay({
  className,
  opacity,
  withCornerGradient = true,
  cornerPosition = "tr",
  cornerGradient,
  tintColor,
  topGradient = false,
  topHeight = 96,
  topTint,
  topBlur = "md",
  topFadeStop = 0.6,
  ...props
}: OverlayProps) {
  const dim = opacity != null ? String(opacity) : "var(--overlay-alpha, .45)";

  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      {...props}
    >
      {/* 1) 全屏底色（整体明暗/偏色） */}
      <div
        className="absolute inset-0"
        style={{
          background: tintColor ?? `rgba(0,0,0,${dim})`,
          // 顶部从 0 开始渐变：0% 完全透明 → 在 alphaStopPct% 处达到 100% 覆盖
        //   maskImage: props.alphaGradient
        //     ? `linear-gradient(to bottom,
        //    rgba(0,0,0,0) 0%,
        //    rgba(0,0,0,1) ${Math.round(props.alphaStopPct ?? 35)}%,
        //    rgba(0,0,0,1) 100%)`
        //     : undefined,
        //   WebkitMaskImage: props.alphaGradient
        //     ? `linear-gradient(to bottom,
        //    rgba(0,0,0,0) 0%,
        //    rgba(0,0,0,1) ${Math.round(props.alphaStopPct ?? 35)}%,
        //    rgba(0,0,0,1) 100%)`
        //     : undefined,
        }}
      />

      {/* 2.5) 对角遮罩：左下→中心、右上→中心（从不透明到透明） */}
      {props.diagonalCorners && (
        <>
          {/* 左下 -> 中心（方向：to top right） */}
          <div
            className="absolute inset-0"
            style={{
              background:
                props.diagonalGradient ??
                // 等价于：bg-gradient-to-b from-purple-900/80 via-purple-800/60 to-blue-900/80
                "linear-gradient(to bottom, rgba(88,28,135,0.80) 0%, rgba(107,33,168,0.60) 50%, rgba(30,58,138,0.80) 100%)",
              opacity: props.diagonalOpacity ?? 1,
              maskImage: `linear-gradient(to top right, black 0%, transparent ${Math.round(
                props.diagonalStopPct ?? 45
              )}%)`,
              WebkitMaskImage: `linear-gradient(to top right, black 0%, transparent ${Math.round(
                props.diagonalStopPct ?? 45
              )}%)`,
            }}
          />
          {/* 右上 -> 中心（方向：to bottom left） */}
          <div
            className="absolute inset-0"
            style={{
              background:
                props.diagonalGradient ??
                "linear-gradient(to bottom, rgba(88,28,135,0.80) 0%, rgba(107,33,168,0.60) 50%, rgba(30,58,138,0.80) 100%)",
              opacity: props.diagonalOpacity ?? 1,
              maskImage: `linear-gradient(to bottom left, black 0%, transparent ${Math.round(
                props.diagonalStopPct ?? 45
              )}%)`,
              WebkitMaskImage: `linear-gradient(to bottom left, black 0%, transparent ${Math.round(
                props.diagonalStopPct ?? 45
              )}%)`,
            }}
          />
        </>
      )}

      {/* 2) 顶部渐隐带（更通透 + 模糊），支持渐变淡出 */}
      {topGradient && (
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: `${topHeight}px`,
            // 这里的 topTint 就是“加深色”，用更高的 alpha 即更暗
            background: topTint ?? "rgba(2, 6, 23, 0.35)",
            ...(topBlur !== "none"
              ? {
                  backdropFilter: `blur(${topBlur === "md" ? "12px" : "8px"})`,
                  WebkitBackdropFilter: `blur(${
                    topBlur === "md" ? "12px" : "8px"
                  })`,
                }
              : {}),
            // 从上（不透明）到下（透明）的渐隐：topFadeStop 决定过渡位置
            // 让顶端 0% = 完全不透明，随后立即开始往下淡出到透明
            maskImage: `linear-gradient(to bottom,
            rgba(0,0,0,1) 0%,
            rgba(0,0,0,0) ${Math.round((topFadeStop ?? 0.6) * 100)}%,
            rgba(0,0,0,0) 100%)`,
            WebkitMaskImage: `linear-gradient(to bottom,
            rgba(0,0,0,1) 0%,
            rgba(0,0,0,0) ${Math.round((topFadeStop ?? 0.6) * 100)}%,
            rgba(0,0,0,0) 100%)`,
          }}
        />
      )}

      {/* 3) 角落氛围光 */}
      {withCornerGradient && (
        <div
          className={cn(
            "absolute h-72 w-72 blur-3xl opacity-55",
            cornerPosition === "tr" && "right-0 top-0",
            cornerPosition === "tl" && "left-0 top-0",
            cornerPosition === "br" && "right-0 bottom-0",
            cornerPosition === "bl" && "left-0 bottom-0"
          )}
          style={{
            background: cornerGradient ?? "var(--overlay-corner-gradient)",
            maskImage:
              "radial-gradient(closest-side, #000 60%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(closest-side, #000 60%, transparent 100%)",
          }}
        />
      )}
    </div>
  );
}
