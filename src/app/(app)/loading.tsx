import { BrandIcon } from "@/components/brand";

export default function AppLoading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-20">
      {/* Animated brand icon */}
      <div className="animate-[app-loading-fade_0.6s_ease-out_forwards]">
        <BrandIcon
          color="color"
          width={48}
          height={58}
          className="animate-[app-loading-pulse_2s_ease-in-out_0.6s_infinite]"
        />
      </div>

      {/* Skeleton loading bar */}
      <div className="h-1 w-24 overflow-hidden rounded-full bg-[#EAF2FF]">
        <div className="h-full w-full origin-left animate-[app-loading-bar_1.6s_ease-in-out_infinite] rounded-full bg-[#0165F0]/50" />
      </div>

      <style>{`
        @keyframes app-loading-fade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes app-loading-pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.5; }
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
