/* eslint-disable @next/next/no-img-element */

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F3F6FA]">
      {/* Logo PNG — renderizado directamente sin contenedores, marcos ni fondos */}
      <img
        src="/brand/logos_PNG_transparente/logo_vertical_color.png"
        alt="ManosCerca"
        className="h-44 w-auto animate-[splash-fade-in_0.8s_ease-out_forwards]"
      />

      {/* Indicador de carga sutil */}
      <div className="mt-8 flex items-center gap-1.5 animate-[splash-fade-in_1s_ease-out_0.4s_both]">
        <span className="size-1.5 rounded-full bg-[#0165F0] animate-[splash-dot_1.4s_ease-in-out_infinite]" />
        <span className="size-1.5 rounded-full bg-[#0165F0] animate-[splash-dot_1.4s_ease-in-out_0.2s_infinite]" />
        <span className="size-1.5 rounded-full bg-[#0165F0] animate-[splash-dot_1.4s_ease-in-out_0.4s_infinite]" />
      </div>

      <style>{`
        @keyframes splash-fade-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes splash-dot {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40%           { opacity: 1;    transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
