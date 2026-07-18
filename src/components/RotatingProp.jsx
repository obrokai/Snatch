import { useRef, useEffect } from "react";

/**
 * 旋轉裝飾器材：360° 轉盤影片（已去背成純黑底）循環播放。
 * 站台底色接近純黑，所以黑底幾乎無縫；再加徑向遮罩把邊緣柔化。
 * playbackRate 放慢做出高級感；prefers-reduced-motion 時停在單一幀。
 */
export default function RotatingProp({
  src,
  className = "",
  rate = 0.5,
  style,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.playbackRate = rate;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      v.currentTime = 0;
    }
  }, [rate]);

  return (
    <div className={`relative ${className}`} style={style}>
      {/* 聚光暈：把黑底圓盤轉成「打光展示台」的刻意效果 */}
      <div
        aria-hidden="true"
        className="absolute -inset-[12%] rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,107,26,0.22), rgba(255,107,26,0.06) 45%, transparent 68%)",
        }}
      />
      <video
        ref={ref}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="relative w-full h-auto pointer-events-none select-none"
        style={{
          // 影片底色是純黑，screen 混合等同把黑色去背（任何底色上都不會出現黑圓盤）
          mixBlendMode: "screen",
          // 邊緣再柔化一次，避免方形邊界
          maskImage: "radial-gradient(circle at 50% 50%, #000 56%, transparent 74%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 56%, transparent 74%)",
        }}
      />
    </div>
  );
}
