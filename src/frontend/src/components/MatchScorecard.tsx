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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { localStore } from "../store/localStore";
import type {
  BallEvent,
  Match,
  Scorecard,
  ScorecardBatsman,
  ScorecardBowler,
} from "../types";

const BALL_STYLES: Record<string, string> = {
  W: "bg-red-500/80 text-white border-red-400",
  "4": "bg-blue-500/80 text-white border-blue-400",
  "6": "bg-purple-500/80 text-white border-purple-400",
  "0": "bg-muted text-muted-foreground border-border",
  "+": "bg-yellow-500/80 text-black border-yellow-400",
};

function ballStyle(b: BallEvent): string {
  return BALL_STYLES[b] ?? "bg-emerald-600/80 text-white border-emerald-500";
}

function calcSR(runs: number, balls: number): string {
  if (balls === 0) return "0.00";
  return ((runs / balls) * 100).toFixed(1);
}

function calcEcon(runs: number, overs: number): string {
  if (overs === 0) return "0.00";
  return (runs / overs).toFixed(2);
}

const emptyBatsman = (): ScorecardBatsman => ({
  name: "",
  runs: 0,
  balls: 0,
  fours: 0,
  sixes: 0,
  dismissal: "not out",
  isNotOut: true,
});

const emptyBowler = (): ScorecardBowler => ({
  name: "",
  overs: 0,
  maidens: 0,
  runs: 0,
  wickets: 0,
});

function emptyScorecard(matchDate: string): Scorecard {
  return {
    matchDate,
    batting: [],
    bowling: [],
    lastBalls: [],
    currentRunRate: 0,
    requiredRunRate: undefined,
    partnership: { runs: 0, balls: 0 },
  };
}

interface Props {
  match: Match;
  isAdmin: boolean;
  isLive: boolean;
}

function BallDot({ ball, position }: { ball: BallEvent; position: number }) {
  return (
    <span
      data-pos={position}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border ${ballStyle(ball)}`}
    >
      {ball}
    </span>
  );
}

function ScorecardEditor({
  scorecard,
  onSave,
}: { scorecard: Scorecard; onSave: (sc: Scorecard) => void }) {
  const [sc, setSc] = useState<Scorecard>(
    JSON.parse(JSON.stringify(scorecard)),
  );

  function updateBatsman(
    idx: number,
    field: keyof ScorecardBatsman,
    val: string | number | boolean,
  ) {
    setSc((prev) => {
      const batting = [...prev.batting];
      batting[idx] = { ...batting[idx], [field]: val };
      return { ...prev, batting };
    });
  }

  function updateBowler(
    idx: number,
    field: keyof ScorecardBowler,
    val: string | number,
  ) {
    setSc((prev) => {
      const bowling = [...prev.bowling];
      bowling[idx] = { ...bowling[idx], [field]: val };
      return { ...prev, bowling };
    });
  }

  function addBatsman() {
    setSc((prev) => ({ ...prev, batting: [...prev.batting, emptyBatsman()] }));
  }

  function addBowler() {
    setSc((prev) => ({ ...prev, bowling: [...prev.bowling, emptyBowler()] }));
  }

  function removeBatsman(idx: number) {
    setSc((prev) => ({
      ...prev,
      batting: prev.batting.filter((_, i) => i !== idx),
    }));
  }

  function removeBowler(idx: number) {
    setSc((prev) => ({
      ...prev,
      bowling: prev.bowling.filter((_, i) => i !== idx),
    }));
  }

  function updateLastBalls(raw: string) {
    const balls = raw
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) =>
        ["W", "4", "6", "0", "1", "2", "3", "+"].includes(s),
      ) as BallEvent[];
    setSc((prev) => ({ ...prev, lastBalls: balls }));
  }

  return (
    <ScrollArea className="max-h-[70vh]">
      <div className="space-y-5 pr-2 pb-4">
        {/* Batting */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Batting
            </Label>
            <Button
              size="sm"
              variant="outline"
              onClick={addBatsman}
              className="h-6 text-xs"
            >
              + Add
            </Button>
          </div>
          {sc.batting.map((bat, idx) => (
            <div
              key={`bat-${idx}-${bat.name || idx}`}
              className="grid grid-cols-6 gap-1.5 mb-2 items-center"
            >
              <Input
                className="col-span-2 h-7 text-xs bg-input"
                placeholder="Name"
                value={bat.name}
                onChange={(e) => updateBatsman(idx, "name", e.target.value)}
                data-ocid="scorecard.input"
              />
              <Input
                type="number"
                className="h-7 text-xs bg-input"
                placeholder="R"
                value={bat.runs}
                onChange={(e) =>
                  updateBatsman(idx, "runs", Number(e.target.value))
                }
              />
              <Input
                type="number"
                className="h-7 text-xs bg-input"
                placeholder="B"
                value={bat.balls}
                onChange={(e) =>
                  updateBatsman(idx, "balls", Number(e.target.value))
                }
              />
              <Input
                type="number"
                className="h-7 text-xs bg-input"
                placeholder="4s"
                value={bat.fours}
                onChange={(e) =>
                  updateBatsman(idx, "fours", Number(e.target.value))
                }
              />
              <Input
                type="number"
                className="h-7 text-xs bg-input"
                placeholder="6s"
                value={bat.sixes}
                onChange={(e) =>
                  updateBatsman(idx, "sixes", Number(e.target.value))
                }
              />
              <Input
                className="col-span-4 h-7 text-xs bg-input"
                placeholder="Dismissal (e.g. c Raza b Ali)"
                value={bat.dismissal}
                onChange={(e) =>
                  updateBatsman(idx, "dismissal", e.target.value)
                }
              />
              <div className="col-span-2 flex items-center gap-1.5">
                <input
                  type="checkbox"
                  id={`notout-${idx}`}
                  checked={bat.isNotOut}
                  onChange={(e) =>
                    updateBatsman(idx, "isNotOut", e.target.checked)
                  }
                  className="accent-primary"
                />
                <Label htmlFor={`notout-${idx}`} className="text-[11px]">
                  Not out
                </Label>
                <button
                  type="button"
                  onClick={() => removeBatsman(idx)}
                  className="ml-auto text-destructive text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bowling */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Bowling
            </Label>
            <Button
              size="sm"
              variant="outline"
              onClick={addBowler}
              className="h-6 text-xs"
            >
              + Add
            </Button>
          </div>
          {sc.bowling.map((bwl, idx) => (
            <div
              key={`bwl-${idx}-${bwl.name || idx}`}
              className="grid grid-cols-6 gap-1.5 mb-2 items-center"
            >
              <Input
                className="col-span-2 h-7 text-xs bg-input"
                placeholder="Bowler"
                value={bwl.name}
                onChange={(e) => updateBowler(idx, "name", e.target.value)}
              />
              <Input
                type="number"
                className="h-7 text-xs bg-input"
                placeholder="O"
                value={bwl.overs}
                onChange={(e) =>
                  updateBowler(idx, "overs", Number(e.target.value))
                }
              />
              <Input
                type="number"
                className="h-7 text-xs bg-input"
                placeholder="M"
                value={bwl.maidens}
                onChange={(e) =>
                  updateBowler(idx, "maidens", Number(e.target.value))
                }
              />
              <Input
                type="number"
                className="h-7 text-xs bg-input"
                placeholder="R"
                value={bwl.runs}
                onChange={(e) =>
                  updateBowler(idx, "runs", Number(e.target.value))
                }
              />
              <div className="flex gap-1 items-center">
                <Input
                  type="number"
                  className="h-7 text-xs bg-input"
                  placeholder="W"
                  value={bwl.wickets}
                  onChange={(e) =>
                    updateBowler(idx, "wickets", Number(e.target.value))
                  }
                />
                <button
                  type="button"
                  onClick={() => removeBowler(idx)}
                  className="text-destructive text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Rates & Partnership */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Current RR</Label>
            <Input
              type="number"
              step="0.01"
              className="mt-1 h-7 text-xs bg-input"
              value={sc.currentRunRate}
              onChange={(e) =>
                setSc((p) => ({ ...p, currentRunRate: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Required RR</Label>
            <Input
              type="number"
              step="0.01"
              className="mt-1 h-7 text-xs bg-input"
              value={sc.requiredRunRate ?? ""}
              onChange={(e) =>
                setSc((p) => ({
                  ...p,
                  requiredRunRate: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                }))
              }
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              Partnership Runs
            </Label>
            <Input
              type="number"
              className="mt-1 h-7 text-xs bg-input"
              value={sc.partnership.runs}
              onChange={(e) =>
                setSc((p) => ({
                  ...p,
                  partnership: {
                    ...p.partnership,
                    runs: Number(e.target.value),
                  },
                }))
              }
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              Partnership Balls
            </Label>
            <Input
              type="number"
              className="mt-1 h-7 text-xs bg-input"
              value={sc.partnership.balls}
              onChange={(e) =>
                setSc((p) => ({
                  ...p,
                  partnership: {
                    ...p.partnership,
                    balls: Number(e.target.value),
                  },
                }))
              }
            />
          </div>
        </div>

        {/* Last balls */}
        <div>
          <Label className="text-xs text-muted-foreground">
            Last 6 balls (comma-separated: W,4,6,0,1,2)
          </Label>
          <Input
            className="mt-1 h-7 text-xs bg-input"
            value={sc.lastBalls.join(", ")}
            onChange={(e) => updateLastBalls(e.target.value)}
            placeholder="e.g. 0, 4, W, 6, 1, 2"
          />
        </div>

        <Button
          className="w-full bg-primary text-primary-foreground"
          onClick={() => onSave(sc)}
          data-ocid="scorecard.save_button"
        >
          Save Scorecard
        </Button>
      </div>
    </ScrollArea>
  );
}

export function MatchScorecard({ match, isAdmin, isLive }: Props) {
  const stored = localStore.getScorecard(match.date);
  const [scorecard, setScorecard] = useState<Scorecard>(
    stored ?? emptyScorecard(match.date),
  );
  const [editOpen, setEditOpen] = useState(false);

  function handleSave(sc: Scorecard) {
    localStore.saveScorecard(sc);
    setScorecard(sc);
    setEditOpen(false);
    toast.success("Scorecard updated");
  }

  const noData =
    scorecard.batting.length === 0 && scorecard.bowling.length === 0;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            vs {match.opponent} · {match.format}
          </span>
        </div>
        {isAdmin && (
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-primary/40 text-primary"
                data-ocid="scorecard.edit_button"
              >
                <Edit2 className="h-3 w-3 mr-1" /> Update
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-card border-border max-w-lg"
              data-ocid="scorecard.dialog"
            >
              <DialogHeader>
                <DialogTitle className="font-display">
                  Update Scorecard
                </DialogTitle>
              </DialogHeader>
              <ScorecardEditor scorecard={scorecard} onSave={handleSave} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Run rates */}
      {(scorecard.currentRunRate > 0 || scorecard.requiredRunRate) && (
        <div className="flex gap-4 bg-secondary/40 rounded-lg px-4 py-2">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">CRR</div>
            <div className="font-mono font-bold text-primary">
              {scorecard.currentRunRate.toFixed(2)}
            </div>
          </div>
          {scorecard.requiredRunRate && (
            <div className="text-center">
              <div className="text-xs text-muted-foreground">RRR</div>
              <div className="font-mono font-bold text-amber-400">
                {scorecard.requiredRunRate.toFixed(2)}
              </div>
            </div>
          )}
          {scorecard.partnership.runs > 0 && (
            <div className="text-center ml-auto">
              <div className="text-xs text-muted-foreground">Partnership</div>
              <div className="font-mono font-bold">
                {scorecard.partnership.runs}({scorecard.partnership.balls})
              </div>
            </div>
          )}
        </div>
      )}

      {/* Last balls */}
      {scorecard.lastBalls.length > 0 && (
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
            Last Over
          </Label>
          <div className="flex gap-1.5 flex-wrap">
            {scorecard.lastBalls
              .slice(-6)
              .map((ball, pos) => ({ ball, ballKey: `b${pos}`, pos }))
              .map(({ ball, ballKey, pos }) => (
                <BallDot key={ballKey} ball={ball} position={pos} />
              ))}
          </div>
        </div>
      )}

      {noData ? (
        <div
          data-ocid="scorecard.empty_state"
          className="text-center py-8 text-muted-foreground text-sm"
        >
          <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>No scorecard data yet.</p>
          {isAdmin && (
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="mt-3 bg-primary text-primary-foreground"
                  data-ocid="scorecard.primary_button"
                >
                  Add Scorecard
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-display">
                    Add Scorecard
                  </DialogTitle>
                </DialogHeader>
                <ScorecardEditor scorecard={scorecard} onSave={handleSave} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      ) : (
        <>
          {/* Batting table */}
          {scorecard.batting.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                Batting
              </Label>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead className="text-xs py-2 text-muted-foreground">
                        Batsman
                      </TableHead>
                      <TableHead className="text-xs py-2 text-right text-muted-foreground">
                        R
                      </TableHead>
                      <TableHead className="text-xs py-2 text-right text-muted-foreground">
                        B
                      </TableHead>
                      <TableHead className="text-xs py-2 text-right text-muted-foreground">
                        4s
                      </TableHead>
                      <TableHead className="text-xs py-2 text-right text-muted-foreground">
                        6s
                      </TableHead>
                      <TableHead className="text-xs py-2 text-right text-muted-foreground">
                        SR
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scorecard.batting.map((bat, idx) => (
                      <TableRow
                        key={`bat-view-${bat.name || idx}`}
                        data-ocid={`scorecard.row.${idx + 1}`}
                        className={`${
                          idx % 2 === 0 ? "bg-card" : "bg-secondary/20"
                        } ${bat.isNotOut ? "font-semibold" : ""}`}
                      >
                        <TableCell className="py-2">
                          <div className="text-xs font-medium">
                            {bat.name}
                            {bat.isNotOut && (
                              <span className="text-primary ml-1">*</span>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {bat.dismissal}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-sm py-2">
                          {bat.runs}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs py-2">
                          {bat.balls}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs py-2 text-blue-400">
                          {bat.fours}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs py-2 text-purple-400">
                          {bat.sixes}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs py-2">
                          {calcSR(bat.runs, bat.balls)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Bowling table */}
          {scorecard.bowling.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                Bowling
              </Label>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead className="text-xs py-2 text-muted-foreground">
                        Bowler
                      </TableHead>
                      <TableHead className="text-xs py-2 text-right text-muted-foreground">
                        O
                      </TableHead>
                      <TableHead className="text-xs py-2 text-right text-muted-foreground">
                        M
                      </TableHead>
                      <TableHead className="text-xs py-2 text-right text-muted-foreground">
                        R
                      </TableHead>
                      <TableHead className="text-xs py-2 text-right text-muted-foreground">
                        W
                      </TableHead>
                      <TableHead className="text-xs py-2 text-right text-muted-foreground">
                        Econ
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scorecard.bowling.map((bwl, idx) => (
                      <TableRow
                        key={`bwl-view-${bwl.name || idx}`}
                        className={
                          idx % 2 === 0 ? "bg-card" : "bg-secondary/20"
                        }
                      >
                        <TableCell className="text-xs font-medium py-2">
                          {bwl.name}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs py-2">
                          {bwl.overs}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs py-2">
                          {bwl.maidens}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs py-2">
                          {bwl.runs}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-sm py-2 text-primary">
                          {bwl.wickets}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs py-2">
                          {calcEcon(bwl.runs, bwl.overs)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
