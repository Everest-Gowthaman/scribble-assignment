import { Router } from "express";
import {
  createRoomSchema,
  HttpError,
  joinRoomSchema,
  roomCodeParamsSchema,
  roomViewerQuerySchema
} from "./schemas.js";
import { createRoom, getRoom, joinRoom, startGame, toRoomSnapshot } from "../services/roomStore.js";

const ROOM_CODE_PATTERN = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/;

function normalizeRoomCode(code: string) {
  const normalizedCode = code.trim().toUpperCase();
  return ROOM_CODE_PATTERN.test(normalizedCode) ? normalizedCode : null;
}

export function createRoomsRouter() {
  const router = Router();

  router.post("/", (request, response, next) => {
    try {
      const { playerName } = createRoomSchema.parse(request.body);
      const normalizedPlayerName = playerName?.trim() ?? "";

      if (!normalizedPlayerName) {
        throw new HttpError(400, "Please enter a player name.");
      }

      const result = createRoom(normalizedPlayerName);

      response.status(201).json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/join", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { playerName } = joinRoomSchema.parse(request.body);
      const normalizedCode = normalizeRoomCode(code);
      const normalizedPlayerName = playerName?.trim() ?? "";

      if (!normalizedCode || !normalizedPlayerName) {
        throw new HttpError(404, "Unable to join room");
      }

      const result = joinRoom(normalizedCode, normalizedPlayerName);

      if (!result) {
        throw new HttpError(404, "Unable to join room");
      }

      response.json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/start", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = roomViewerQuerySchema.parse(request.query);
      const normalizedCode = normalizeRoomCode(code);

      if (!normalizedCode) {
        throw new HttpError(404, "Unable to load room");
      }

      const room = getRoom(normalizedCode);

      if (!room) {
        throw new HttpError(404, "Unable to load room");
      }

      if (participantId !== room.hostId) {
        throw new HttpError(403, "Only the host can start the game");
      }

      const startedRoom = startGame(normalizedCode);

      if (!startedRoom) {
        throw new HttpError(400, "Unable to start game");
      }

      response.json({
        room: toRoomSnapshot(startedRoom, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:code", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = roomViewerQuerySchema.parse(request.query);
      const normalizedCode = normalizeRoomCode(code);

      if (!normalizedCode) {
        throw new HttpError(404, "Unable to load room");
      }

      const room = getRoom(normalizedCode);

      if (!room) {
        throw new HttpError(404, "Unable to load room");
      }

      response.json({
        room: toRoomSnapshot(room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
