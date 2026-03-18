import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Persistent, Persistent__2 } from "../backend.d";
import { useActor } from "./useActor";

// ── Payments ──────────────────────────────────────────────────────────────────

export function useGetPayments() {
  const { actor, isFetching } = useActor();
  return useQuery<Persistent[]>({
    queryKey: ["payments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPaymentsByPlayer(mobile: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Persistent[]>({
    queryKey: ["payments", "player", mobile],
    queryFn: async () => {
      if (!actor || !mobile) return [];
      return actor.getPaymentsByPlayer(mobile);
    },
    enabled: !!actor && !isFetching && !!mobile,
  });
}

export function useGetFinanceSummary() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["finance-summary"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getFinanceSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payment: Persistent) => {
      if (!actor) throw new Error("Not connected");
      await actor.addPayment(payment);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["finance-summary"] });
    },
  });
}

export function useUpdatePayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payment,
    }: { id: string; payment: Persistent }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updatePayment(id, payment);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["finance-summary"] });
    },
  });
}

export function useDeletePayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deletePayment(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["finance-summary"] });
    },
  });
}

// ── Live Score ────────────────────────────────────────────────────────────────

export function useGetLiveScore(matchDate: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Persistent__2 | null>({
    queryKey: ["live-score", matchDate],
    queryFn: async () => {
      if (!actor || !matchDate) return null;
      return actor.getLiveScore(matchDate);
    },
    enabled: !!actor && !isFetching && !!matchDate,
    refetchInterval: 30000,
  });
}

export function useSetLiveScore() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchDate,
      score,
    }: { matchDate: string; score: Persistent__2 }) => {
      if (!actor) throw new Error("Not connected");
      await actor.setLiveScore(matchDate, score);
    },
    onSuccess: (_d, { matchDate }) => {
      qc.invalidateQueries({ queryKey: ["live-score", matchDate] });
    },
  });
}

export function useClearLiveScore() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (matchDate: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.clearLiveScore(matchDate);
    },
    onSuccess: (_d, matchDate) => {
      qc.invalidateQueries({ queryKey: ["live-score", matchDate] });
    },
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
