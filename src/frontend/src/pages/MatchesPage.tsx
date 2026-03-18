import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Edit2, Plus, Trash2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Persistent__2 } from "../backend.d";
import { LiveScoreBadge } from "../components/LiveScoreBadge";
import { MatchLineup } from "../components/MatchLineup";
import { MatchScorecard } from "../components/MatchScorecard";
import {
  useClearLiveScore,
  useGetLiveScore,
  useSetLiveScore,
} from "../hooks/useQueries";
import { localStore } from "../store/localStore";
import type { Match } from "../types";

const FORMATS = ["T20", "ODI", "Test", "T10"] as const;
const RESULTS = ["", "Won", "Lost", "Draw", "No Result"] as const;

function emptyMatch(): Omit<Match, "id"> {
  return {
    opponent: "",
    date: new Date().toISOString().split("T")[0],
    venue: "",
    format: "T20",
  };
}

function MatchCard({
  match,
  isAdmin,
  settings,
}: { match: Match; isAdmin: boolean; settings: { teamName: string } }) {
  const { data: liveScore, refetch } = useGetLiveScore(match.date);
  const setScore = useSetLiveScore();
  const clearScore = useClearLiveScore();
  const [scoreOpen, setScoreOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const players = localStore.getPlayers();
  const lineup = localStore.getLineup(match.date);
  const playingXICount = lineup?.players.length ?? 0;
  const [form, setForm] = useState<Persistent__2>({
    oversPerInning: BigInt(20),
    isLive: true,
    matchFormat: match.format,
    inning1: {
      battingTeam: settings.teamName,
      runs: BigInt(0),
      wickets: BigInt(0),
      overs: BigInt(0),
    },
    inning2: [],
  });

  const resultColor: Record<string, string> = {
    Won: "bg-success/20 text-success border-success/40",
    Lost: "bg-destructive/20 text-destructive border-destructive/40",
    Draw: "bg-secondary text-secondary-foreground border-border",
  };

  async function handleSaveScore() {
    await setScore.mutateAsync({ matchDate: match.date, score: form });
    await refetch();
    toast.success("Live score updated");
    setScoreOpen(false);
  }

  async function handleClearScore() {
    await clearScore.mutateAsync(match.date);
    toast.success("Score cleared");
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      {/* Match header - always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-4 space-y-3"
        data-ocid="matches.card.button"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-display font-bold">vs {match.opponent}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {match.date} · {match.venue}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {liveScore?.isLive && (
              <span className="flex items-center gap-1 text-xs font-bold text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            )}
            <Badge variant="outline" className="text-xs">
              {match.format}
            </Badge>
            {match.result && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${resultColor[match.result] || "bg-secondary text-secondary-foreground border-border"}`}
              >
                {match.result}
              </span>
            )}
            {playingXICount > 0 && (
              <Badge variant="outline" className="text-xs gap-1">
                <Users className="h-3 w-3" />
                {playingXICount}
              </Badge>
            )}
          </div>
        </div>

        {liveScore?.isLive ? (
          <LiveScoreBadge score={liveScore} />
        ) : match.teamScore || match.oppScore ? (
          <div className="flex gap-4 text-sm">
            {match.teamScore && (
              <span>
                <span className="text-muted-foreground">SW:</span>{" "}
                <span className="font-mono font-bold text-primary">
                  {match.teamScore}
                </span>
              </span>
            )}
            {match.oppScore && (
              <span>
                <span className="text-muted-foreground">Opp:</span>{" "}
                <span className="font-mono">{match.oppScore}</span>
              </span>
            )}
          </div>
        ) : null}
      </button>

      {/* Expanded tabs */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4">
          <Tabs
            defaultValue={liveScore?.isLive ? "scorecard" : "lineup"}
            className="mt-3"
          >
            <TabsList className="w-full bg-secondary/50 mb-3">
              <TabsTrigger
                value="lineup"
                className="flex-1 text-xs"
                data-ocid="matches.lineup.tab"
              >
                Lineup
              </TabsTrigger>
              <TabsTrigger
                value="scorecard"
                className="flex-1 text-xs"
                data-ocid="matches.scorecard.tab"
              >
                Scorecard
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger
                  value="score"
                  className="flex-1 text-xs"
                  data-ocid="matches.livescore.tab"
                >
                  Live Score
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="lineup">
              <MatchLineup match={match} players={players} isAdmin={isAdmin} />
            </TabsContent>

            <TabsContent value="scorecard">
              <MatchScorecard
                match={match}
                isAdmin={isAdmin}
                isLive={!!liveScore?.isLive}
              />
            </TabsContent>

            {isAdmin && (
              <TabsContent value="score">
                <Dialog open={scoreOpen} onOpenChange={setScoreOpen}>
                  <DialogTrigger asChild>
                    <Button
                      data-ocid="matches.score.edit_button"
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 border-primary/40 text-primary"
                    >
                      <Activity className="h-3 w-3 mr-1" /> Set Live Score
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="bg-card border-border max-w-sm"
                    data-ocid="matches.score.dialog"
                  >
                    <DialogHeader>
                      <DialogTitle className="font-display">
                        Set Live Score
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-3">
                        <Switch
                          data-ocid="matches.score.switch"
                          checked={form.isLive}
                          onCheckedChange={(v) =>
                            setForm((p) => ({ ...p, isLive: v }))
                          }
                        />
                        <Label>Is Live</Label>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Batting Team
                        </Label>
                        <Input
                          data-ocid="matches.score.input"
                          value={form.inning1.battingTeam}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              inning1: {
                                ...p.inning1,
                                battingTeam: e.target.value,
                              },
                            }))
                          }
                          className="mt-1 bg-input"
                          placeholder="Team name"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Runs
                          </Label>
                          <Input
                            type="number"
                            value={Number(form.inning1.runs)}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                inning1: {
                                  ...p.inning1,
                                  runs: BigInt(e.target.value || 0),
                                },
                              }))
                            }
                            className="mt-1 bg-input"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Wickets
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            value={Number(form.inning1.wickets)}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                inning1: {
                                  ...p.inning1,
                                  wickets: BigInt(e.target.value || 0),
                                },
                              }))
                            }
                            className="mt-1 bg-input"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Overs
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            value={Number(form.inning1.overs)}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                inning1: {
                                  ...p.inning1,
                                  overs: BigInt(e.target.value || 0),
                                },
                              }))
                            }
                            className="mt-1 bg-input"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Target (2nd innings)
                        </Label>
                        <Input
                          type="number"
                          placeholder="Leave blank if 1st innings"
                          value={
                            form.inning1.targetScore != null
                              ? Number(form.inning1.targetScore)
                              : ""
                          }
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              inning1: {
                                ...p.inning1,
                                targetScore: e.target.value
                                  ? BigInt(e.target.value)
                                  : undefined,
                              },
                            }))
                          }
                          className="mt-1 bg-input"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          data-ocid="matches.score.save_button"
                          onClick={handleSaveScore}
                          disabled={setScore.isPending}
                          className="flex-1 bg-primary text-primary-foreground"
                        >
                          {setScore.isPending ? "Saving..." : "Save Score"}
                        </Button>
                        {liveScore && (
                          <Button
                            data-ocid="matches.score.delete_button"
                            variant="outline"
                            onClick={handleClearScore}
                            className="border-destructive/40 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </motion.div>
  );
}

interface Props {
  isAdmin: boolean;
  settings: { teamName: string };
}

export default function MatchesPage({ isAdmin, settings }: Props) {
  const [matches, setMatches] = useState<Match[]>(localStore.getMatches());
  const [addOpen, setAddOpen] = useState(false);
  const [editMatch, setEditMatch] = useState<Match | null>(null);
  const [form, setForm] = useState<Omit<Match, "id">>(emptyMatch());

  function persist(updated: Match[]) {
    setMatches(updated);
    localStore.saveMatches(updated);
  }

  function handleSave() {
    if (!form.opponent || !form.date || !form.venue) {
      toast.error("Fill all required fields");
      return;
    }
    if (editMatch) {
      persist(
        matches.map((m) =>
          m.id === editMatch.id ? { ...editMatch, ...form } : m,
        ),
      );
      toast.success("Match updated");
    } else {
      persist([...matches, { ...form, id: Date.now().toString() }]);
      toast.success("Match added");
    }
    setAddOpen(false);
    setEditMatch(null);
    setForm(emptyMatch());
  }

  function openEdit(m: Match) {
    setEditMatch(m);
    setForm({
      opponent: m.opponent,
      date: m.date,
      venue: m.venue,
      format: m.format,
      result: m.result,
      teamScore: m.teamScore,
      oppScore: m.oppScore,
    });
    setAddOpen(true);
  }

  function deleteMatch(id: string) {
    persist(matches.filter((m) => m.id !== id));
    toast.success("Match removed");
  }

  const sorted = [...matches].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold">Matches</h1>
        {isAdmin && (
          <Dialog
            open={addOpen}
            onOpenChange={(v) => {
              setAddOpen(v);
              if (!v) {
                setEditMatch(null);
                setForm(emptyMatch());
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                data-ocid="matches.open_modal_button"
                size="sm"
                className="bg-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-card border-border max-w-sm"
              data-ocid="matches.dialog"
            >
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editMatch ? "Edit Match" : "Add Match"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Opponent *
                  </Label>
                  <Input
                    data-ocid="matches.input"
                    value={form.opponent}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, opponent: e.target.value }))
                    }
                    className="mt-1 bg-input"
                    placeholder="Team name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Date *
                    </Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, date: e.target.value }))
                      }
                      className="mt-1 bg-input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Format
                    </Label>
                    <Select
                      value={form.format}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, format: v as Match["format"] }))
                      }
                    >
                      <SelectTrigger className="mt-1 bg-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {FORMATS.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Venue *
                  </Label>
                  <Input
                    value={form.venue}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, venue: e.target.value }))
                    }
                    className="mt-1 bg-input"
                    placeholder="Stadium name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Result
                    </Label>
                    <Select
                      value={form.result || ""}
                      onValueChange={(v) =>
                        setForm((p) => ({
                          ...p,
                          result: (v || undefined) as Match["result"],
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1 bg-input">
                        <SelectValue placeholder="TBD" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {RESULTS.map((r) => (
                          <SelectItem key={r || "tbd"} value={r || "tbd"}>
                            {r || "TBD"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Team Score
                    </Label>
                    <Input
                      value={form.teamScore || ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, teamScore: e.target.value }))
                      }
                      className="mt-1 bg-input"
                      placeholder="e.g. 145/5"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Opp Score
                  </Label>
                  <Input
                    value={form.oppScore || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, oppScore: e.target.value }))
                    }
                    className="mt-1 bg-input"
                    placeholder="e.g. 140/8"
                  />
                </div>
                <Button
                  data-ocid="matches.save_button"
                  onClick={handleSave}
                  className="w-full bg-primary text-primary-foreground mt-2"
                >
                  {editMatch ? "Update Match" : "Add Match"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {sorted.length === 0 && (
        <div
          data-ocid="matches.empty_state"
          className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm"
        >
          No matches yet. Add your first match!
        </div>
      )}

      <div className="space-y-3" data-ocid="matches.list">
        {sorted.map((m, i) => (
          <div
            key={m.id}
            data-ocid={`matches.item.${i + 1}`}
            className="relative group"
          >
            <MatchCard match={m} isAdmin={isAdmin} settings={settings} />
            {isAdmin && (
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  type="button"
                  onClick={() => openEdit(m)}
                  className="p-1.5 rounded-md bg-secondary hover:bg-accent transition-colors"
                  data-ocid={`matches.edit_button.${i + 1}`}
                >
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteMatch(m.id)}
                  className="p-1.5 rounded-md bg-secondary hover:bg-destructive/20 transition-colors"
                  data-ocid={`matches.delete_button.${i + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
