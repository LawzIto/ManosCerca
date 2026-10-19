/* eslint-disable @next/next/no-img-element */

export default function AppLoading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-20">
      {/* Isotipo PNG directo — sin wrapper con fondo */}
      <img
        src="/brand/logos_PNG_transparente/isotipo_color.png"
        alt="ManosCerca"
        width={48}
        height={58}
        className="animate-[app-loading-fade_0.6s_ease-out_forwards]"
      />

      {/* Barra de carga skeleton */}
      <div className="h-1 w-24 overflow-hidden rounded-full bg-[#EAF2FF]">
        <div className="h-full w-full origin-left animate-[app-loading-bar_1.6s_ease-in-out_infinite] rounded-full bg-[#0165F0]/50" />
      </div>

      <style>{`
        @keyframes app-loading-fade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes app-loading-bar {
          0%   { transform: scaleX(0); }
          50%  { transform: scaleX(1); }
          100% { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}
