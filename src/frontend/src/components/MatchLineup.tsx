import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, Shield, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { localStore } from "../store/localStore";
import type { LineupPlayer, Match, Player } from "../types";

const ROLE_COLORS: Record<string, string> = {
  Batsman: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Bowler: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "All-rounder": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "Wicket-keeper": "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

interface Props {
  match: Match;
  players: Player[];
  isAdmin: boolean;
}

export function MatchLineup({ match, players, isAdmin }: Props) {
  const stored = localStore.getLineup(match.date);
  const [lineup, setLineup] = useState<LineupPlayer[]>(stored?.players ?? []);
  const [editing, setEditing] = useState(false);

  // draft state for admin editing
  const [draft, setDraft] = useState<LineupPlayer[]>(lineup);

  function togglePlayer(playerId: string) {
    setDraft((prev) => {
      const exists = prev.find((p) => p.playerId === playerId);
      if (exists) {
        return prev.filter((p) => p.playerId !== playerId);
      }
      if (prev.length >= 11) {
        toast.error("Maximum 11 players in lineup");
        return prev;
      }
      return [
        ...prev,
        {
          playerId,
          battingOrder: prev.length + 1,
          isCaptain: false,
          isWicketKeeper: false,
        },
      ];
    });
  }

  function setOrder(playerId: string, order: number) {
    setDraft((prev) =>
      prev.map((p) =>
        p.playerId === playerId ? { ...p, battingOrder: order } : p,
      ),
    );
  }

  function toggleCaptain(playerId: string) {
    setDraft((prev) =>
      prev.map((p) => ({
        ...p,
        isCaptain: p.playerId === playerId ? !p.isCaptain : false,
      })),
    );
  }

  function toggleWK(playerId: string) {
    setDraft((prev) =>
      prev.map((p) => ({
        ...p,
        isWicketKeeper: p.playerId === playerId ? !p.isWicketKeeper : false,
      })),
    );
  }

  function handleSave() {
    const sorted = [...draft].sort((a, b) => a.battingOrder - b.battingOrder);
    const newLineup = { matchDate: match.date, players: sorted };
    localStore.saveLineup(newLineup);
    setLineup(sorted);
    setEditing(false);
    toast.success("Lineup saved");
  }

  function startEdit() {
    setDraft(lineup);
    setEditing(true);
  }

  const sortedLineup = [...lineup].sort(
    (a, b) => a.battingOrder - b.battingOrder,
  );

  if (editing && isAdmin) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Select up to 11 players ({draft.length}/11)
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(false)}
              className="h-7 text-xs"
              data-ocid="lineup.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="h-7 text-xs bg-primary text-primary-foreground"
              data-ocid="lineup.save_button"
            >
              Save XI
            </Button>
          </div>
        </div>

        <ScrollArea className="h-64">
          <div className="space-y-1 pr-2">
            {players.map((player) => {
              const inDraft = draft.find((d) => d.playerId === player.id);
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 rounded-lg p-2.5 border transition-colors ${
                    inDraft
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  <Checkbox
                    checked={!!inDraft}
                    onCheckedChange={() => togglePlayer(player.id)}
                    data-ocid={`lineup.checkbox.${player.id}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {player.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                          ROLE_COLORS[player.role]
                        }`}
                      >
                        {player.role}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        #{player.jerseyNumber}
                      </span>
                    </div>
                  </div>
                  {inDraft && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Input
                        type="number"
                        min={1}
                        max={11}
                        value={inDraft.battingOrder}
                        onChange={(e) =>
                          setOrder(
                            player.id,
                            Number.parseInt(e.target.value) || 1,
                          )
                        }
                        className="w-12 h-7 text-xs text-center bg-input"
                        data-ocid="lineup.input"
                      />
                      <button
                        type="button"
                        title="Captain"
                        onClick={() => toggleCaptain(player.id)}
                        className={`p-1 rounded ${
                          inDraft.isCaptain
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Crown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Wicket-keeper"
                        onClick={() => toggleWK(player.id)}
                        className={`p-1 rounded ${
                          inDraft.isWicketKeeper
                            ? "text-purple-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Shield className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (sortedLineup.length === 0) {
    return (
      <div
        data-ocid="lineup.empty_state"
        className="text-center py-8 text-muted-foreground text-sm"
      >
        <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p>No lineup set yet.</p>
        {isAdmin && (
          <Button
            size="sm"
            onClick={startEdit}
            className="mt-3 bg-primary text-primary-foreground"
            data-ocid="lineup.primary_button"
          >
            Set Playing XI
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Playing XI
        </Label>
        {isAdmin && (
          <Button
            size="sm"
            variant="outline"
            onClick={startEdit}
            className="h-7 text-xs border-primary/40 text-primary"
            data-ocid="lineup.edit_button"
          >
            Edit Lineup
          </Button>
        )}
      </div>
      <div className="space-y-1">
        {sortedLineup.map((lp, idx) => {
          const player = players.find((p) => p.id === lp.playerId);
          if (!player) return null;
          return (
            <motion.div
              key={lp.playerId}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              data-ocid={`lineup.item.${idx + 1}`}
              className="flex items-center gap-3 py-2 px-3 rounded-lg bg-card border border-border"
            >
              <span className="text-primary font-mono font-bold text-sm w-5 text-center">
                {lp.battingOrder}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{player.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                    ROLE_COLORS[player.role]
                  }`}
                >
                  {player.role === "Wicket-keeper"
                    ? "WK"
                    : player.role === "All-rounder"
                      ? "AR"
                      : player.role === "Batsman"
                        ? "BAT"
                        : "BWL"}
                </span>
                {lp.isCaptain && (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 px-1 border-primary/60 text-primary"
                  >
                    <Crown className="h-2.5 w-2.5 mr-0.5" /> C
                  </Badge>
                )}
                {lp.isWicketKeeper && (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 px-1 border-purple-500/60 text-purple-400"
                  >
                    <Shield className="h-2.5 w-2.5 mr-0.5" /> WK
                  </Badge>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
