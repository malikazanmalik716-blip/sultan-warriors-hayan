import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Clock,
  Copy,
  Edit2,
  Plus,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Persistent } from "../backend.d";
import { Persistent__1 as Category } from "../backend.d";
import {
  useAddPayment,
  useDeletePayment,
  useGetFinanceSummary,
  useGetPayments,
  useGetPaymentsByPlayer,
  useUpdatePayment,
} from "../hooks/useQueries";
import { localStore } from "../store/localStore";

const CATEGORY_LABELS: Record<string, string> = {
  kitFee: "Kit Fee",
  matchFee: "Match Fee",
  other: "Other",
};

function emptyPayment(playerMobile = ""): Persistent {
  return {
    id: "",
    playerMobile,
    category: Category.kitFee,
    description: "",
    amount: BigInt(0),
    date: new Date().toISOString().split("T")[0],
    isPaid: false,
  };
}

function fmt(amount: bigint) {
  return `Rs. ${Number(amount).toLocaleString()}`;
}

const UPI_ID = "9797907569@fam";

interface Props {
  isAdmin: boolean;
  userMobile: string;
}

export default function FinancePage({ isAdmin, userMobile }: Props) {
  const players = localStore.getPlayers();
  const matches = localStore.getMatches();

  const allPaymentsQ = useGetPayments();
  const playerPaymentsQ = useGetPaymentsByPlayer(isAdmin ? "" : userMobile);
  const summaryQ = useGetFinanceSummary();
  const addMut = useAddPayment();
  const updateMut = useUpdatePayment();
  const deleteMut = useDeletePayment();

  const payments = isAdmin
    ? allPaymentsQ.data || []
    : playerPaymentsQ.data || [];
  const summary = summaryQ.data;

  const [addOpen, setAddOpen] = useState(false);
  const [editPayment, setEditPayment] = useState<Persistent | null>(null);
  const [form, setForm] = useState<Persistent>(emptyPayment());

  function openAdd() {
    setEditPayment(null);
    setForm(emptyPayment());
    setAddOpen(true);
  }

  function openEdit(p: Persistent) {
    setEditPayment(p);
    setForm({ ...p });
    setAddOpen(true);
  }

  async function handleSave() {
    if (!form.playerMobile || !form.description || !form.amount) {
      toast.error("Fill all required fields");
      return;
    }
    const record = { ...form, id: editPayment ? form.id : `pay_${Date.now()}` };
    if (editPayment) {
      await updateMut.mutateAsync({ id: editPayment.id, payment: record });
      toast.success("Payment updated");
    } else {
      await addMut.mutateAsync(record);
      toast.success("Payment added");
    }
    setAddOpen(false);
    setEditPayment(null);
    setForm(emptyPayment());
  }

  async function handleDelete(id: string) {
    await deleteMut.mutateAsync(id);
    toast.success("Payment deleted");
  }

  function copyUpi() {
    navigator.clipboard.writeText(UPI_ID);
    toast.success("UPI ID copied!");
  }

  const isLoading = isAdmin
    ? allPaymentsQ.isLoading
    : playerPaymentsQ.isLoading;

  const unpaidCount = payments.filter((p) => !p.isPaid).length;

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold">Finance</h1>
        {isAdmin && (
          <Button
            data-ocid="finance.open_modal_button"
            size="sm"
            onClick={openAdd}
            className="bg-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        )}
      </div>

      {/* UPI Payment Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 bg-gradient-to-r from-violet-500/15 to-indigo-500/10 border border-violet-500/30 rounded-xl px-4 py-3"
      >
        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-violet-500/20 shrink-0">
          <Wallet className="h-4 w-4 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">Pay via UPI</p>
          <p className="text-sm font-mono font-semibold text-violet-300 truncate">
            {UPI_ID}
          </p>
        </div>
        <button
          type="button"
          onClick={copyUpi}
          data-ocid="finance.button"
          className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-lg px-2.5 py-1.5 transition-colors shrink-0"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      </motion.div>

      {/* KPI Cards */}
      {isAdmin && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: TrendingUp,
              label: "Collected",
              value: summary ? fmt(summary.totalCollected) : "—",
              gradient: "from-emerald-500/20 to-emerald-500/5",
              textColor: "text-emerald-400",
            },
            {
              icon: Clock,
              label: "Pending",
              value: summary ? fmt(summary.totalPending) : "—",
              gradient: "from-amber-500/20 to-amber-500/5",
              textColor: "text-amber-400",
            },
            {
              icon: Users,
              label: "Unpaid",
              value: unpaidCount.toString(),
              gradient: "from-red-500/20 to-red-500/5",
              textColor: "text-red-400",
            },
          ].map(({ icon: Icon, label, value, gradient, textColor }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-gradient-to-br ${gradient} rounded-xl border border-border p-3`}
            >
              <Icon className={`h-4 w-4 ${textColor} mb-1`} />
              <div className={`text-sm font-bold font-display ${textColor}`}>
                {value}
              </div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Payments list */}
      <div
        className="bg-card border border-border rounded-xl overflow-hidden"
        data-ocid="finance.table"
      >
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-display font-semibold text-sm">
            {isAdmin ? "All Payments" : "My Payments"}
          </h2>
        </div>

        {isLoading ? (
          <div data-ocid="finance.loading_state" className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div
            data-ocid="finance.empty_state"
            className="p-8 text-center text-muted-foreground text-sm"
          >
            No payment records yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {payments.map((pay, i) => {
              const player = players.find(
                (pl) => pl.mobile === pay.playerMobile,
              );
              return (
                <div
                  key={pay.id}
                  data-ocid={`finance.item.${i + 1}`}
                  className="px-4 py-3 flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        {player?.name || pay.playerMobile}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                        {CATEGORY_LABELS[pay.category] || pay.category}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {pay.description}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-mono font-bold text-primary">
                        {fmt(pay.amount)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {pay.date}
                      </span>
                      <Badge
                        className={
                          pay.isPaid
                            ? "bg-success/20 text-success border-success/40 text-xs px-1.5 py-0"
                            : "bg-destructive/20 text-destructive border-destructive/40 text-xs px-1.5 py-0"
                        }
                        variant="outline"
                      >
                        {pay.isPaid ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEdit(pay)}
                        data-ocid={`finance.edit_button.${i + 1}`}
                        className="p-1.5 rounded-md hover:bg-accent"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(pay.id)}
                        data-ocid={`finance.delete_button.${i + 1}`}
                        className="p-1.5 rounded-md hover:bg-destructive/20"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit dialog */}
      {isAdmin && (
        <Dialog
          open={addOpen}
          onOpenChange={(v) => {
            setAddOpen(v);
            if (!v) {
              setEditPayment(null);
              setForm(emptyPayment());
            }
          }}
        >
          <DialogContent
            className="bg-card border-border max-w-sm"
            data-ocid="finance.dialog"
          >
            <DialogHeader>
              <DialogTitle className="font-display">
                {editPayment ? "Edit Payment" : "Add Payment"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Player *
                </Label>
                <Select
                  value={form.playerMobile}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, playerMobile: v }))
                  }
                >
                  <SelectTrigger
                    data-ocid="finance.select"
                    className="mt-1 bg-input"
                  >
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {players.map((pl) => (
                      <SelectItem key={pl.mobile} value={pl.mobile}>
                        {pl.name} ({pl.mobile})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Category
                  </Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      setForm((p) => ({
                        ...p,
                        category: v as typeof Category.kitFee,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1 bg-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value={Category.kitFee}>Kit Fee</SelectItem>
                      <SelectItem value={Category.matchFee}>
                        Match Fee
                      </SelectItem>
                      <SelectItem value={Category.other}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Amount (Rs.)
                  </Label>
                  <Input
                    data-ocid="finance.input"
                    type="number"
                    min="0"
                    value={Number(form.amount)}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        amount: BigInt(e.target.value || 0),
                      }))
                    }
                    className="mt-1 bg-input"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Description *
                </Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="mt-1 bg-input"
                  placeholder="Kit payment for 2026 season"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
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
                    Match (optional)
                  </Label>
                  <Select
                    value={form.matchDate || ""}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, matchDate: v || undefined }))
                    }
                  >
                    <SelectTrigger className="mt-1 bg-input">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="none">None</SelectItem>
                      {matches.map((m) => (
                        <SelectItem key={m.date} value={m.date}>
                          vs {m.opponent} ({m.date})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  data-ocid="finance.switch"
                  checked={form.isPaid}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, isPaid: v }))}
                />
                <Label>Mark as Paid</Label>
              </div>
              <Button
                data-ocid="finance.submit_button"
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="w-full bg-primary text-primary-foreground mt-2"
              >
                {addMut.isPending || updateMut.isPending
                  ? "Saving..."
                  : editPayment
                    ? "Update Payment"
                    : "Add Payment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
