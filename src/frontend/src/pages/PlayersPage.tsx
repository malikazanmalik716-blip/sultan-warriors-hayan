import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Edit2, Plus, Shield, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { localStore } from "../store/localStore";
import type { Player } from "../types";

const ROLES: Player["role"][] = [
  "Batsman",
  "Bowler",
  "All-rounder",
  "Wicket-keeper",
];

const roleColors: Record<string, string> = {
  Batsman: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  Bowler: "bg-red-500/20 text-red-300 border-red-500/40",
  "All-rounder": "bg-primary/20 text-primary border-primary/40",
  "Wicket-keeper": "bg-purple-500/20 text-purple-300 border-purple-500/40",
};

function emptyPlayer(): Omit<Player, "id"> {
  return { name: "", mobile: "", role: "Batsman", jerseyNumber: 1 };
}

interface Props {
  isAdmin: boolean;
  captainMobile: string;
}

export default function PlayersPage({ isAdmin, captainMobile }: Props) {
  const [players, setPlayers] = useState<Player[]>(localStore.getPlayers());
  const [addOpen, setAddOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [form, setForm] = useState<Omit<Player, "id">>(emptyPlayer());

  function persist(updated: Player[]) {
    setPlayers(updated);
    localStore.savePlayers(updated);
  }

  function handleSave() {
    if (!form.name || !form.mobile) {
      toast.error("Name and mobile are required");
      return;
    }
    if (!/^03\d{9}$/.test(form.mobile)) {
      toast.error("Enter valid mobile: 03XXXXXXXXX");
      return;
    }
    if (editPlayer) {
      persist(
        players.map((p) =>
          p.id === editPlayer.id ? { ...editPlayer, ...form } : p,
        ),
      );
      toast.success("Player updated");
    } else {
      if (players.find((p) => p.mobile === form.mobile)) {
        toast.error("Mobile already registered");
        return;
      }
      persist([...players, { ...form, id: Date.now().toString() }]);
      toast.success("Player added");
    }
    setAddOpen(false);
    setEditPlayer(null);
    setForm(emptyPlayer());
  }

  function openEdit(p: Player) {
    setEditPlayer(p);
    setForm({
      name: p.name,
      mobile: p.mobile,
      role: p.role,
      jerseyNumber: p.jerseyNumber,
      battingStyle: p.battingStyle,
      bowlingStyle: p.bowlingStyle,
    });
    setAddOpen(true);
  }

  function deletePlayer(id: string) {
    persist(players.filter((p) => p.id !== id));
    toast.success("Player removed");
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold">Players</h1>
        {isAdmin && (
          <Dialog
            open={addOpen}
            onOpenChange={(v) => {
              setAddOpen(v);
              if (!v) {
                setEditPlayer(null);
                setForm(emptyPlayer());
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                data-ocid="players.open_modal_button"
                size="sm"
                className="bg-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-card border-border max-w-sm"
              data-ocid="players.dialog"
            >
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editPlayer ? "Edit Player" : "Add Player"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Full Name *
                  </Label>
                  <Input
                    data-ocid="players.input"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="mt-1 bg-input"
                    placeholder="Ahmed Khan"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Mobile *
                  </Label>
                  <Input
                    value={form.mobile}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, mobile: e.target.value }))
                    }
                    className="mt-1 bg-input"
                    placeholder="03XXXXXXXXX"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Role
                    </Label>
                    <Select
                      value={form.role}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, role: v as Player["role"] }))
                      }
                    >
                      <SelectTrigger className="mt-1 bg-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Jersey #
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="99"
                      value={form.jerseyNumber}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          jerseyNumber: Number(e.target.value),
                        }))
                      }
                      className="mt-1 bg-input"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Batting Style
                  </Label>
                  <Input
                    value={form.battingStyle || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, battingStyle: e.target.value }))
                    }
                    className="mt-1 bg-input"
                    placeholder="Right-hand bat"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Bowling Style
                  </Label>
                  <Input
                    value={form.bowlingStyle || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, bowlingStyle: e.target.value }))
                    }
                    className="mt-1 bg-input"
                    placeholder="Right-arm fast"
                  />
                </div>
                <Button
                  data-ocid="players.save_button"
                  onClick={handleSave}
                  className="w-full bg-primary text-primary-foreground mt-2"
                >
                  {editPlayer ? "Update Player" : "Add Player"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {players.length === 0 && (
        <div
          data-ocid="players.empty_state"
          className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm"
        >
          No players yet.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3" data-ocid="players.list">
        {players.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            data-ocid={`players.item.${i + 1}`}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 group"
          >
            <Avatar className="h-12 w-12 border-2 border-primary/30">
              <AvatarFallback className="bg-primary/20 text-primary font-display font-bold text-lg">
                #{p.jerseyNumber}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate">{p.name}</span>
                {p.mobile === captainMobile && (
                  <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">{p.mobile}</div>
              <div className="mt-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${roleColors[p.role]}`}
                >
                  {p.role}
                </span>
              </div>
            </div>
            {isAdmin && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  data-ocid={`players.edit_button.${i + 1}`}
                  className="p-1.5 rounded-md bg-secondary hover:bg-accent"
                >
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => deletePlayer(p.id)}
                  data-ocid={`players.delete_button.${i + 1}`}
                  className="p-1.5 rounded-md bg-secondary hover:bg-destructive/20"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
