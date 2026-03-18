import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Persistent {
    id: string;
    date: string;
    description: string;
    isPaid: boolean;
    category: Persistent__1;
    playerMobile: string;
    amount: bigint;
    matchDate?: string;
}
export interface Persistent__2 {
    oversPerInning: bigint;
    isLive: boolean;
    matchFormat: string;
    inning1: Persistent__3;
    inning2: Array<[string, bigint]>;
}
export interface Persistent__3 {
    targetScore?: bigint;
    overs: bigint;
    battingTeam: string;
    runs: bigint;
    wickets: bigint;
}
export enum Persistent__1 {
    other = "other",
    kitFee = "kitFee",
    matchFee = "matchFee"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPayment(_payment: Persistent): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearLiveScore(_matchDate: string): Promise<void>;
    deletePayment(_id: string): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getFinanceSummary(): Promise<{
        totalCollected: bigint;
        totalPending: bigint;
        perPlayerSummary: Array<[string, {
                pending: bigint;
                collected: bigint;
            }]>;
    }>;
    getLiveScore(_matchDate: string): Promise<Persistent__2 | null>;
    getPayments(): Promise<Array<Persistent>>;
    getPaymentsByPlayer(_mobileNumber: string): Promise<Array<Persistent>>;
    isCallerAdmin(): Promise<boolean>;
    setLiveScore(_matchDate: string, _liveScore: Persistent__2): Promise<void>;
    updatePayment(_id: string, _updatedPayment: Persistent): Promise<void>;
}
