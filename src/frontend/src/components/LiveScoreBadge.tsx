import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import type { Persistent__2 } from "../backend.d";

interface Props {
  score: Persistent__2;
  compact?: boolean;
}

export function LiveScoreBadge({ score, compact }: Props) {
  const i1 = score.inning1;
  const overs = Number(i1.overs);
  const oversDisplay =
    overs % 1 === 0
      ? `${overs}`
      : `${Math.floor(overs)}.${Math.round((overs % 1) * 10)}`;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-mono font-bold text-primary">
        <Activity className="h-3 w-3 animate-pulse text-red-400" />
        {Number(i1.runs)}/{Number(i1.wickets)} ({oversDisplay})
      </span>
    );
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="h-4 w-4 animate-pulse text-red-400" />
        <Badge variant="destructive" className="text-xs px-1.5 py-0">
          LIVE
        </Badge>
        <span className="text-xs text-muted-foreground">
          {score.matchFormat}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-display font-bold text-primary">
          {Number(i1.runs)}/{Number(i1.wickets)}
        </span>
        <span className="text-sm text-muted-foreground">
          ({oversDisplay} ov)
        </span>
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">
        {i1.battingTeam} batting
        {i1.targetScore != null && <> · Target: {Number(i1.targetScore)}</>}
      </div>
    </div>
  );
}
