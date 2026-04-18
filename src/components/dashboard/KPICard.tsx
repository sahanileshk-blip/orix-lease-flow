import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { direction: "up" | "down" | "flat"; percent: number };
  insight?: string;
  iconBg?: string;
  valueColor?: string;
  onClick?: () => void;
}

export function KPICard({ label, value, icon, trend, insight, iconBg = "bg-primary/10", valueColor, onClick }: KPICardProps) {
  const trendColor = trend?.direction === "up" ? "text-emerald-500" : trend?.direction === "down" ? "text-rose-500" : "text-amber-500";
  const TrendIcon = trend?.direction === "up" ? TrendingUp : trend?.direction === "down" ? TrendingDown : Minus;

  return (
    <div
      className="kpi-card group select-none"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={e => e.key === "Enter" && onClick?.()}
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
          <p className={`text-2xl font-bold mt-1.5 font-heading leading-none ${valueColor ?? ""}`}>{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColor}`}>
              <TrendIcon className="h-3 w-3" />
              <span>{trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : ""}{trend.percent}%</span>
              <span className="text-muted-foreground font-normal">vs last period</span>
            </div>
          )}
          {insight && (
            <p className="mt-2 text-[11px] text-muted-foreground leading-snug border-t border-border/50 pt-2">{insight}</p>
          )}
        </div>
        <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 ml-3 group-hover:scale-105 transition-transform`}>
          {icon}
        </div>
      </div>
      {onClick && (
        <p className="mt-3 text-[10px] text-primary/60 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Click to explore →</p>
      )}
    </div>
  );
}

/* Skeleton variant */
export function KPICardSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-7 w-32 rounded" />
          <div className="skeleton h-3 w-36 rounded" />
          <div className="skeleton h-3 w-44 mt-3 rounded" />
        </div>
        <div className="skeleton h-10 w-10 rounded-xl ml-3" />
      </div>
    </div>
  );
}
