/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/utils/db/supabase';
import Button from '../Button';
import { useEffect, useState } from 'react';
import { fetchPlayers } from '@/utils/db/players';
import { handleGameStatusChange } from '@/utils/gameManager';
import PageContainer from '../PageContainer';
import { Leaderboard, LeaderboardEntry } from '../Leaderboard';
import { getGuessesForRound } from '@/utils/db/guesses';

// Dummy data for testing the animation
const DUMMY_PLAYERS = [
  { id: 'p1', name: 'The Hitmakers', score: 8, is_dj: false },
  { id: 'p2', name: 'Chart Toppers', score: 5, is_dj: false },
  { id: 'p3', name: 'The Vinyls', score: 5, is_dj: false },
  { id: 'p4', name: 'Groove Masters', score: 5, is_dj: false },
  { id: 'p5', name: 'Rhythm Riders', score: 4, is_dj: false },
  { id: 'p6', name: 'The Harmonizers', score: 4, is_dj: false },
  { id: 'p7', name: 'Tune Detectives', score: 4, is_dj: false },
  { id: 'p8', name: 'Beat Squad', score: 3, is_dj: false },
  { id: 'p9', name: 'Melody Makers', score: 2, is_dj: false },
];

const DUMMY_GUESSES = [
  { player_id: 'p1', game_id: 'test', round_id: 'r1', round: 1, correct: true },
  { player_id: 'p2', game_id: 'test', round_id: 'r1', round: 1, correct: false },
  { player_id: 'p3', game_id: 'test', round_id: 'r1', round: 1, correct: true },
  { player_id: 'p4', game_id: 'test', round_id: 'r1', round: 1, correct: false },
  { player_id: 'p5', game_id: 'test', round_id: 'r1', round: 1, correct: false },
  { player_id: 'p6', game_id: 'test', round_id: 'r1', round: 1, correct: true },
  { player_id: 'p7', game_id: 'test', round_id: 'r1', round: 1, correct: true },
  { player_id: 'p8', game_id: 'test', round_id: 'r1', round: 1, correct: false },
  { player_id: 'p9', game_id: 'test', round_id: 'r1', round: 1, correct: false },
];

export default function LeaderboardScreen({
  gameId,
  game,
}: {
  gameId: string;
  game: any;
}) {
  const [players, setPlayers] = useState<any[]>([]);
  const [lastRound, setLastRound] = useState<any>(null);
  const [showCurrentScores, setShowCurrentScores] = useState(false);

  useEffect(() => {
    fetchPlayers({ gameId }).then(players => {
      setPlayers(players || []);
    });
  }, []);

  useEffect(() => {
    getGuessesForRound({ gameId, round: game.round }).then(guesses => {
      setLastRound(guesses);
    });
  }, []);

  // After showing previous scores + the +1 indicators, animate to current scores.
  useEffect(() => {
    if (players.length === 0 || !lastRound) return;
    const timer = setTimeout(() => setShowCurrentScores(true), 3000);
    return () => clearTimeout(timer);
  }, [players.length, lastRound]);

  const goToNextSong = async () => {
    handleGameStatusChange({ gameId });
  };

  if (players.length === 0 || !lastRound) return null;

  const pointGetters = new Set<string>(
    (lastRound as any[]).filter(g => g.correct).map(g => g.player_id),
  );

  const nonDjPlayers = players.filter(p => !p.is_dj);
  const prevScore = (player: any) => player.score - (pointGetters.has(player.id) ? 1 : 0);

  // Start sorted by previous score; after delay re-sort by current score.
  const sorted = [...nonDjPlayers].sort((a, b) =>
    showCurrentScores ? b.score - a.score : prevScore(b) - prevScore(a),
  );

  return (
    <PageContainer className="bg-transparent">
      <div className="fixed top-0 right-0 p-4">
        <Button onClick={goToNextSong}>Next song</Button>
      </div>
      <Leaderboard>
        {sorted.map(player => (
          <LeaderboardEntry
            key={player.id}
            name={player.name}
            score={showCurrentScores ? player.score : prevScore(player)}
            gotPoint={pointGetters.has(player.id)}
          />
        ))}
      </Leaderboard>
    </PageContainer>
  );
}
