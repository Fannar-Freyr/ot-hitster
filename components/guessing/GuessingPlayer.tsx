/* eslint-disable react-hooks/set-state-in-effect */
import Card from '../Card';
import Hand from '../Hand';
import { DragDropProvider } from '@dnd-kit/react';
import { PointerSensor, PointerActivationConstraints } from '@dnd-kit/dom';
import { useEffect, useState } from 'react';
import Button from '../Button';
import { supabase } from '@/utils/db/supabase';
import { fetchPlayerSongs } from '@/utils/db/songOwners';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function GuessingPlayer({
  gameId,
  playerId,
}: {
  gameId: string;
  playerId: string;
}) {
  const [emptyTitle, setEmptyTitle] = useState<string>('????');
  const [guess, setGuess] = useState<number[]>([]);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [songs, setSongs] = useState<any[]>([]);

  const handleConfirm = () => {
    setHasConfirmed(!hasConfirmed);
    supabase.channel(`guessing-screen-${gameId}`).send({
      type: 'broadcast',
      event: 'guess_confirmed',
      payload: { playerId: playerId, has_confirmed: !hasConfirmed },
    });
  };

  const handleGuessing = () => {
    supabase.channel(`guessing-screen-${gameId}`).send({
      type: 'broadcast',
      event: 'sending-guess',
      payload: { playerId: playerId, guess },
    });
  };

  useEffect(() => {
    if (songs.length === 0) {
      fetchPlayerSongs({ playerId }).then(songs => {
        if (!songs) {
          console.error('No songs found for player:', playerId);
          return;
        }
        songs.sort((a, b) => a.year - b.year);
        setSongs(songs);
      });
    }
  }, [gameId, playerId]);

  return (
    <DragDropProvider
      sensors={defaults => [
        ...defaults.filter(sensor => sensor !== PointerSensor),
        PointerSensor.configure({
          activationConstraints: [
            new PointerActivationConstraints.Distance({ value: 0 }),
          ],
        }),
      ]}
      onBeforeDragStart={event => {
        if (event.operation.source?.data.disabled) {
          event.preventDefault();
        }
      }}
      onDragOver={event => {
        const source = event.operation.source;
        const target = event.operation.target;
        if (source && target) {
          const index = source.data.index as number;
          const start = songs[index - 1];
          const end = songs[index];
          console.log(guess);
          if (start && end && start.year === end.year) {
            setEmptyTitle(`${start.year}`);
            setGuess([start.year, start.year]);
          } else if (start && end) {
            setEmptyTitle(`${start.year} - ${end.year}`);
            setGuess([start.year, end.year]);
          } else if (start) {
            setEmptyTitle(`${start.year} - ?`);
            setGuess([start.year, Number.MAX_SAFE_INTEGER]);
          } else {
            setEmptyTitle(`? - ${end.year}`);
            setGuess([0, end.year]);
          }
        }
      }}
      onDragEnd={() => {
        handleGuessing();
      }}
    >
      <div
        className="flex flex-col items-center min-h-[calc(100dvh-(--spacing(16)))] p-2 justify-center"
        style={{ touchAction: 'none' }}
      >
        <div className="flex justify-center items-center h-16 bg-black text-white w-full fixed bottom-0">
          <div className="text-lg font-bold">
            <Button onClick={handleConfirm}>
              {hasConfirmed ? 'Confirmed!' : 'Confirm'}
            </Button>
          </div>
        </div>
        <Hand>
          <Card key="empty" title={emptyTitle} year={0} id="empty" index={0} emptyCard />
          {songs.map((song, index) => (
            <Card
              key={song.title}
              id={song.title}
              index={index + 1}
              title={song.title}
              artist={song.artist}
              year={song.year}
            />
          ))}
        </Hand>
      </div>
    </DragDropProvider>
  );
}
