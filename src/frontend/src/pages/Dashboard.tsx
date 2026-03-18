import { Calendar, Trophy, Users } from "lucide-react";
import { motion } from "motion/react";
import { LiveScoreBadge } from "../components/LiveScoreBadge";
import { useGetLiveScore } from "../hooks/useQueries";
import { localStore } from "../store/localStore";
import type { BallEvent, Match } from "../types";

const BALL_COLORS: Record<string, string> = {
  W: "bg-red-500 text-white",
  "4": "bg-blue-500 text-white",
  "6": "bg-purple-500 text-white",
  "0": "bg-muted text-muted-foreground",
  "+": "bg-yellow-500 text-black",
};

function ballColor(b: BallEvent): string {
  return BALL_COLORS[b] ?? "bg-emerald-600 text-white";
}

interface Props {
  isAdmin: boolean;
  userMobile: string;
  onNavigate: (tab: string) => void;
}

function MatchRow({ match }: { match: Match }) {
  const { data: liveScore } = useGetLiveScore(match.date);
  const resultColor =
    match.result === "Won"
      ? "text-success"
      : match.result === "Lost"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <div className="font-medium text-sm">{match.opponent}</div>
        <div className="text-xs text-muted-foreground">
          {match.date} · {match.venue}
        </div>
      </div>
      <div className="text-right">
        {liveScore?.isLive ? (
          <LiveScoreBadge score={liveScore} compact />
        ) : match.result ? (
          <>
            <div className={`text-sm font-bold ${resultColor}`}>
              {match.result}
            </div>
            {match.teamScore && (
              <div className="text-xs text-muted-foreground">
                {match.teamScore}
              </div>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {match.format}
          </span>
        )}
      </div>
    </div>
  );
}

function LiveMatchBanner({ match }: { match: Match }) {
  const { data: liveScore } = useGetLiveScore(match.date);
  const scorecard = localStore.getScorecard(match.date);
  const notOutBatsmen =
    scorecard?.batting.filter((b) => b.isNotOut).slice(0, 2) ?? [];
  const lastBalls = scorecard?.lastBalls.slice(-6) ?? [];

  if (!liveScore?.isLive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-red-500/40 bg-gradient-to-br from-red-950/30 via-card to-card p-4 space-y-3"
    >
      {/* LIVE badge + match info */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          LIVE
        </span>
        <span className="text-sm font-semibold">vs {match.opponent}</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {match.format}
        </span>
      </div>

      {/* Main score */}
      <LiveScoreBadge score={liveScore} />

      {/* Current batsmen */}
      {notOutBatsmen.length > 0 && (
        <div className="space-y-1">
          {notOutBatsmen.map((bat) => (
            <div
              key={bat.name}
              className="flex items-center justify-between text-xs"
            >
              <span className="font-medium">
                {bat.name}
                <span className="text-primary ml-1">*</span>
              </span>
              <span className="font-mono text-muted-foreground">
                {bat.runs}({bat.balls})
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Last over balls */}
      {lastBalls.length > 0 && (
        <div>
          <div className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wide">
            Last over
          </div>
          <div className="flex gap-1.5">
            {lastBalls
              .map((ball, pos) => ({ ball, ballKey: `b${pos}` }))
              .map(({ ball, ballKey }) => (
                <span
                  key={ballKey}
                  className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${ballColor(ball)}`}
                >
                  {ball}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Run rates */}
      {scorecard && scorecard.currentRunRate > 0 && (
        <div className="flex gap-4 pt-1 border-t border-border/50">
          <div className="text-xs">
            <span className="text-muted-foreground">CRR </span>
            <span className="font-mono font-bold text-primary">
              {scorecard.currentRunRate.toFixed(2)}
            </span>
          </div>
          {scorecard.requiredRunRate && (
            <div className="text-xs">
              <span className="text-muted-foreground">RRR </span>
              <span className="font-mono font-bold text-amber-400">
                {scorecard.requiredRunRate.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function Dashboard({ isAdmin, userMobile, onNavigate }: Props) {
  const matches = localStore.getMatches();
  const players = localStore.getPlayers();
  const settings = localStore.getSettings();
  const upcoming = matches.filter((m) => !m.result);
  const liveMatch = upcoming[0];
  const { data: liveScore } = useGetLiveScore(liveMatch?.date || "");
  const recent = [...matches]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);
  const won = matches.filter((m) => m.result === "Won").length;

  return (
    <div className="space-y-5 pb-4">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/30 via-card to-card border border-primary/20 p-5"
      >
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold text-primary tracking-widest uppercase">
              Sultan Warriors
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold">
            {settings.teamName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Season 2026 · {matches.length} Matches Played · {won} Wins
          </p>
        </div>
      </motion.div>

      {/* Live match banner - full scorecard view */}
      {liveScore?.isLive && liveMatch && <LiveMatchBanner match={liveMatch} />}

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: Calendar,
            label: "Matches",
            value: matches.length,
            action: "matches",
          },
          {
            icon: Users,
            label: "Players",
            value: players.length,
            action: "players",
          },
          { icon: Trophy, label: "Wins", value: won, action: "matches" },
        ].map(({ icon: Icon, label, value, action }, i) => (
          <motion.button
            type="button"
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onNavigate(action)}
            className="bg-card border border-border rounded-xl p-3 text-left hover:border-primary/50 transition-colors"
          >
            <Icon className="h-5 w-5 text-primary mb-1" />
            <div className="text-xl font-display font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </motion.button>
        ))}
      </div>

      {/* Recent matches */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Recent Matches
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("matches")}
            className="text-xs text-primary hover:underline"
          >
            View all
          </button>
        </div>
        {recent.map((m) => (
          <MatchRow key={m.id} match={m} />
        ))}
      </div>

      {!isAdmin && (
        <div className="bg-card border border-border/50 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Logged in as{" "}
            <span className="text-primary font-medium">{userMobile}</span>
          </p>
        </div>
      )}
    </div>
  );
}
