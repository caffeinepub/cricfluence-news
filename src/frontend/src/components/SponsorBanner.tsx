import { Position } from "../backend.d";
import { useActiveSponsorsByPosition } from "../hooks/useQueries";

interface SponsorBannerProps {
  position: Position;
}

const POSITION_CONFIG = {
  [Position.top]: {
    ocid: "sponsor.banner.top",
    // Leaderboard: 728×90 desktop, 320×50 mobile
    containerClass: "flex flex-col items-center gap-1 my-4",
    bannerClass:
      "w-[320px] h-[50px] sm:w-[728px] sm:h-[90px] overflow-hidden rounded",
  },
  [Position.bottom]: {
    ocid: "sponsor.banner.bottom",
    containerClass: "flex flex-col items-center gap-1 my-4",
    bannerClass:
      "w-[320px] h-[50px] sm:w-[728px] sm:h-[90px] overflow-hidden rounded",
  },
  [Position.mid]: {
    ocid: "sponsor.banner.mid",
    // Medium rectangle: 300×250
    containerClass: "flex flex-col items-center gap-1 my-6",
    bannerClass: "w-[300px] h-[250px] overflow-hidden rounded",
  },
};

export function SponsorBanner({ position }: SponsorBannerProps) {
  const { data: sponsors } = useActiveSponsorsByPosition(position);
  const cfg = POSITION_CONFIG[position];

  if (!sponsors || sponsors.length === 0) return null;

  return (
    <div data-ocid={cfg.ocid} className={cfg.containerClass}>
      {sponsors.map((sponsor) => (
        <div
          key={sponsor.id.toString()}
          className="flex flex-col items-center gap-0.5"
        >
          <span className="text-[10px] text-muted-foreground/60 tracking-widest uppercase font-mono">
            Advertisement
          </span>
          <a
            href={sponsor.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={sponsor.title}
            className={`${cfg.bannerClass} block bg-muted border border-border hover:border-primary/30 transition-colors duration-200`}
          >
            <img
              src={sponsor.imageUrl}
              alt={sponsor.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </a>
        </div>
      ))}
    </div>
  );
}
