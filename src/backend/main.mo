import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Persistent Types
  module Team {
    public type Persistent = {
      name : Text;
      seasonYear : Nat;
    };
  };

  module Innings {
    public type Persistent = {
      battingTeam : Text;
      runs : Nat;
      wickets : Nat;
      overs : Nat;
      targetScore : ?Nat;
    };
  };

  module PersistentLiveScore {
    public type Persistent = {
      inning1 : Innings.Persistent;
      inning2 : Map.Map<Text, Nat>;
      matchFormat : Text; // ODI, T20, Test
      isLive : Bool;
      oversPerInning : Nat;
    };
  };

  module LiveScore {
    public type Persistent = {
      inning1 : Innings.Persistent;
      inning2 : [(Text, Nat)];
      matchFormat : Text; // ODI, T20, Test
      isLive : Bool;
      oversPerInning : Nat;
    };

    public func toPersistent(immutableScore : Persistent) : PersistentLiveScore.Persistent {
      {
        inning1 = immutableScore.inning1;
        inning2 = Map.fromArray(immutableScore.inning2);
        matchFormat = immutableScore.matchFormat;
        isLive = immutableScore.isLive;
        oversPerInning = immutableScore.oversPerInning;
      };
    };

    public func fromPersistent(score : PersistentLiveScore.Persistent) : Persistent {
      {
        inning1 = score.inning1;
        inning2 = score.inning2.toArray();
        matchFormat = score.matchFormat;
        isLive = score.isLive;
        oversPerInning = score.oversPerInning;
      };
    };
  };

  module Player {
    public type Persistent = {
      name : Text;
      mobileNumber : Text;
      role : Text;
      isDeleted : Bool;
      jerseyNumber : ?Nat;
      battingStats : Nat;
      bowlingStats : Nat;
    };
  };

  module Match {
    public type Persistent = {
      date : Text;
      opponentTeam : Text;
      venue : Text;
      format : Text;
      result : Text;
      ourScore : Nat;
      opponentScore : Nat;
      notes : Text;
    };
  };

  module PlayerMatchStats {
    public type Persistent = {
      matchDate : Text;
      playerMobile : Text;
      runs : Nat;
      ballsFaced : Nat;
    };
  };

  module PaymentCategory {
    public type Persistent = {
      #kitFee;
      #matchFee;
      #other;
    };
  };

  module PaymentRecord {
    public type Persistent = {
      id : Text;
      playerMobile : Text;
      category : PaymentCategory.Persistent;
      description : Text;
      amount : Nat;
      date : Text;
      isPaid : Bool;
      matchDate : ?Text;
    };

    public func compare(record1 : Persistent, record2 : Persistent) : Order.Order {
      Text.compare(record1.id, record2.id);
    };
  };

  // Storage
  let teams = Map.empty<Text, Team.Persistent>();
  let players = Map.empty<Text, Player.Persistent>();
  let matches = Map.empty<Text, Match.Persistent>();
  let liveScores = Map.empty<Text, PersistentLiveScore.Persistent>();
  let paymentRecords = Map.empty<Text, PaymentRecord.Persistent>();

  // MatchStats Persistent Type
  module MatchStats {
    public type Persistent = {
      date : Text;
      opponentTeam : Text;
      venue : Text;
      format : Text;
      result : Text;
      ourScore : Nat;
      opponentScore : Nat;
      notes : Text;
    };
  };

  // Live Score APIs
  public query ({ caller }) func getLiveScore(_matchDate : Text) : async ?LiveScore.Persistent {
    switch (liveScores.get(_matchDate)) {
      case (null) { null };
      case (?score) { ?LiveScore.fromPersistent(score) };
    };
  };

  public shared ({ caller }) func setLiveScore(_matchDate : Text, _liveScore : LiveScore.Persistent) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set live scores");
    };
    liveScores.add(_matchDate, LiveScore.toPersistent(_liveScore));
  };

  public shared ({ caller }) func clearLiveScore(_matchDate : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear live scores");
    };
    liveScores.remove(_matchDate);
  };

  // Payment APIs
  public shared ({ caller }) func addPayment(_payment : PaymentRecord.Persistent) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add payments");
    };
    if (paymentRecords.containsKey(_payment.id)) {
      Runtime.trap("Payment with this ID already exists");
    };
    paymentRecords.add(_payment.id, _payment);
  };

  public shared ({ caller }) func updatePayment(_id : Text, _updatedPayment : PaymentRecord.Persistent) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update payments");
    };
    if (not paymentRecords.containsKey(_id)) {
      Runtime.trap("Payment not found");
    };
    paymentRecords.add(_id, _updatedPayment);
  };

  public shared ({ caller }) func deletePayment(_id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete payments");
    };
    if (not paymentRecords.containsKey(_id)) { Runtime.trap("Payment not found") };
    paymentRecords.remove(_id);
  };

  public query ({ caller }) func getPayments() : async [PaymentRecord.Persistent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payments");
    };
    paymentRecords.values().toArray().sort();
  };

  public query ({ caller }) func getPaymentsByPlayer(_mobileNumber : Text) : async [PaymentRecord.Persistent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payment records");
    };

    paymentRecords.values().toArray().filter(
      func(record) {
        record.playerMobile == _mobileNumber;
      }
    );
  };

  public query ({ caller }) func getFinanceSummary() : async {
    totalCollected : Nat;
    totalPending : Nat;
    perPlayerSummary : [(Text, { collected : Nat; pending : Nat })];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view finance summary");
    };

    var totalCollected = 0;
    var totalPending = 0;
    let perPlayer = Map.empty<Text, { collected : Nat; pending : Nat }>();

    paymentRecords.values().toArray().forEach(
      func(record) {
        let player = record.playerMobile;
        let current = switch (perPlayer.get(player)) {
          case (null) { { collected = 0; pending = 0 } };
          case (?stats) { stats };
        };

        if (record.isPaid) {
          totalCollected += record.amount;
          perPlayer.add(player, { collected = current.collected + record.amount; pending = current.pending });
        } else {
          totalPending += record.amount;
          perPlayer.add(player, { collected = current.collected; pending = current.pending + record.amount });
        };
      }
    );

    let perPlayerSummary = perPlayer.toArray();

    {
      totalCollected;
      totalPending;
      perPlayerSummary;
    };
  };
};
