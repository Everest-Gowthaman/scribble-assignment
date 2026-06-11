import { describe, expect, it } from "vitest";
import { createRoom, joinRoom, startGame, toRoomSnapshot } from "./roomStore.js";

describe("roomStore", () => {
  it("createRoom returns a room with a 4-character uppercase code", () => {
    const result = createRoom("Alice");

    expect(result.room.code).toMatch(/^[A-Z0-9]{4}$/);
    expect(result.room.participants).toHaveLength(1);
    expect(result.room.participants[0].name).toBe("Alice");
    expect(result.participantId).toBeDefined();
    expect(result.room.hostId).toBe(result.participantId);
    expect(result.room.hostId).toBe(result.room.participants[0].id);
  });

  it("joinRoom returns null for an unknown room code", () => {
    const result = joinRoom("ZZZZ", "Bob");

    expect(result).toBeNull();
  });

  it("startGame transitions a lobby room to playing and assigns drawer/secret word", () => {
    const { room, participantId: hostId } = createRoom("Alice");
    const joinResult = joinRoom(room.code, "Bob");

    expect(joinResult).not.toBeNull();
    const guesserId = joinResult?.participantId;

    const startedRoom = startGame(room.code);

    expect(startedRoom).not.toBeNull();
    expect(startedRoom?.status).toBe("playing");
    expect(startedRoom?.drawerId).toBe(room.hostId);
    expect(startedRoom?.secretWord).toBeDefined();

    const drawerSnapshot = toRoomSnapshot(startedRoom!, startedRoom!.drawerId);
    expect(drawerSnapshot.secretWord).toBe(startedRoom?.secretWord);

    const guesserSnapshot = toRoomSnapshot(startedRoom!, guesserId);
    expect(guesserSnapshot.secretWord).toBeUndefined();
  });
});
