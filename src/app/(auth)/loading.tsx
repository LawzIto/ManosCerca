/* eslint-disable @next/next/no-img-element */

export default function AuthLoading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      {/* Logo PNG directo — sin contenedor wrapper, sin fondo, sin bordes */}
      <img
        src="/brand/logos_PNG_transparente/logo_vertical_color.png"
        alt="ManosCerca"
        className="h-28 w-auto animate-[auth-loading-fade_0.7s_ease-out_forwards]"
      />

      <div className="flex items-center gap-1.5 animate-[auth-loading-fade_0.8s_ease-out_0.3s_both]">
        <span className="size-1.5 rounded-full bg-[#0165F0] animate-[auth-dot_1.4s_ease-in-out_infinite]" />
        <span className="size-1.5 rounded-full bg-[#0165F0] animate-[auth-dot_1.4s_ease-in-out_0.2s_infinite]" />
        <span className="size-1.5 rounded-full bg-[#0165F0] animate-[auth-dot_1.4s_ease-in-out_0.4s_infinite]" />
      </div>

      <style>{`
        @keyframes auth-loading-fade {
          from { opacity: 0; transform: scale(0.95) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes auth-dot {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40%           { opacity: 1;    transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
