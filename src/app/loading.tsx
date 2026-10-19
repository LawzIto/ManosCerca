/* eslint-disable @next/next/no-img-element */

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F3F6FA]">
      {/* Gradient overlay for organic blending */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(1,101,240,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Logo with fade-in and subtle pulse animation */}
      <div className="relative flex flex-col items-center gap-6 animate-[splash-fade-in_0.8s_ease-out_forwards]">
        {/*
          Using <img> directly instead of next/image to render the SVG
          with a fully transparent background — no container, no borders,
          no white rectangles around it.
        */}
        <img
          src="/brand/logos_SVG/logo_vertical_color.svg"
          alt="ManosCerca"
          className="h-44 w-auto animate-[splash-pulse_2.4s_ease-in-out_0.8s_infinite] drop-shadow-none"
          style={{ filter: "none", background: "transparent" }}
        />

        {/* Subtle loading indicator */}
        <div className="flex items-center gap-1.5 animate-[splash-fade-in_1s_ease-out_0.4s_both]">
          <span className="size-1.5 rounded-full bg-[#0165F0] animate-[splash-dot_1.4s_ease-in-out_infinite]" />
          <span className="size-1.5 rounded-full bg-[#0165F0] animate-[splash-dot_1.4s_ease-in-out_0.2s_infinite]" />
          <span className="size-1.5 rounded-full bg-[#0165F0] animate-[splash-dot_1.4s_ease-in-out_0.4s_infinite]" />
        </div>
      </div>

      {/* Inline keyframes — scoped to loading screen */}
      <style>{`
        @keyframes splash-fade-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes splash-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.03); opacity: 0.92; }
        }
        @keyframes splash-dot {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40%           { opacity: 1;    transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
