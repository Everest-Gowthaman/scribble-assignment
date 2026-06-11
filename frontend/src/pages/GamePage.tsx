import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { GuessForm } from "../components/GuessForm";
import { ResultPanel } from "../components/ResultPanel";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { Scoreboard } from "../components/Scoreboard";
import { useRoomState } from "../state/roomStore";

export function GamePage() {
  const navigate = useNavigate();
  const { room, participantId } = useRoomState();

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
    }
  }, [navigate, room]);

  if (!room) {
    return null;
  }

  const viewer = room.participants.find((participant) => participant.id === participantId) ?? null;
  const drawer = room.participants.find((participant) => participant.id === room.drawerId) ?? null;
  const isPlaying = room.status === "playing";

  return (
    <section className="panel game-page">
      <div className="game-page__header">
        <div className="game-page__header-left">
          <span className="section-kicker">Round 1</span>
          <h1 className="game-page__title">Guess the Word!</h1>
        </div>
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="game-page__layout">
        <aside className="game-page__sidebar game-page__sidebar--left">
          <Scoreboard />
          <ResultPanel />
        </aside>

        <div className="game-page__main">
          <Card title="Canvas">
            <div className="canvas-placeholder" style={{ minHeight: '500px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
              {isPlaying ? "Drawing is in progress..." : "Waiting for the host to start the round..."}
            </div>
          </Card>
        </div>

        <aside className="game-page__sidebar game-page__sidebar--right">
          <Card title="Player Info">
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{viewer?.name ?? "Unknown player"}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{room.isDrawer ? "Drawer" : "Guesser"}</dd>
              </div>
              <div>
                <dt>Round</dt>
                <dd>{isPlaying ? "1" : "Preparing"}</dd>
              </div>
              {drawer ? (
                <>
                  <div>
                    <dt>Drawer</dt>
                    <dd>{drawer.name}</dd>
                  </div>
                  {room.isDrawer ? (
                    <div>
                      <dt>Secret Word</dt>
                      <dd>{room.secretWord ?? "Loading..."}</dd>
                    </div>
                  ) : null}
                </>
              ) : null}
            </dl>
          </Card>

          <Card title={room.isDrawer ? "Your Drawing Prompt" : "Your Guess"}>
            {room.isDrawer ? (
              <p>{room.secretWord ? `Draw: ${room.secretWord}` : "Fetching your secret word..."}</p>
            ) : (
              <GuessForm />
            )}
          </Card>
        </aside>
      </div>

      <div className="button-row">
        <button className="button button--secondary" onClick={() => navigate("/lobby")}>
          Exit Game
        </button>
      </div>
    </section>
  );
}
