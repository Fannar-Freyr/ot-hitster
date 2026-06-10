/* eslint-disable react-hooks/set-state-in-effect */
import Card from '../Card';
import Hand from '../Hand';
import { DragDropProvider } from '@dnd-kit/react';
import { PointerSensor, PointerActivationConstraints } from '@dnd-kit/dom';
import { useEffect, useState } from 'react';
import Button from '../Button';
import { supabase } from '@/utils/db/supabase';
import { fetchPlayerSongs } from '@/utils/db/songOwners';
import EmojiPicker from '@/components/EmojiPicker';
import { useEmojiSender } from '@/hooks/useEmojiSender';

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [songs, setSongs] = useState<any[]>([]);

  const handleConfirm = () => {
    if (hasConfirmed) {
      setHasConfirmed(false);
      supabase.channel(`guessing-screen-${gameId}`).send({
        type: 'broadcast',
        event: 'guess_confirmed',
        payload: { playerId: playerId, has_confirmed: false },
      });
    } else {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmYes = () => {
    setShowConfirmDialog(false);
    setHasConfirmed(true);
    supabase.channel(`guessing-screen-${gameId}`).send({
      type: 'broadcast',
      event: 'guess_confirmed',
      payload: { playerId: playerId, has_confirmed: true },
    });
  };

  const { sendEmoji } = useEmojiSender({
    channelName: `guessing-screen-${gameId}`,
    playerId,
  });

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

  if (hasConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-3xl font-bold text-black">Confirmed!</p>
        <EmojiPicker onEmojiSelect={sendEmoji} />
      </div>
    );
  }

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
          const index = (source as any).index;
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
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-6 shadow-xl">
            <p className="text-2xl font-bold text-black">Are you sure?</p>
            <div className="flex gap-4">
              <div
                className="rounded-xl px-6 py-2 text-xl cursor-pointer select-none bg-emerald-500 text-white hover:bg-emerald-600 transition-colors duration-200"
                onClick={handleConfirmYes}
              >
                Yes
              </div>
              <div
                className="rounded-xl px-6 py-2 text-xl cursor-pointer select-none bg-rose-500 text-white hover:bg-rose-600 transition-colors duration-200"
                onClick={() => setShowConfirmDialog(false)}
              >
                No
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        className="flex flex-col items-center min-h-[calc(100dvh-(--spacing(16)))] p-2 justify-center"
        style={{ touchAction: 'none' }}
      >
        <div
          className="flex justify-center items-center bg-black text-white w-full fixed bottom-0 transition-all duration-300"
          style={{ height: '4rem' }}
        >
          {hasConfirmed ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg font-bold">Confirmed!</span>
            </div>
          ) : (
            <div className="text-lg font-bold">
              {guess.length === 0 ? (
                'Make your guess!'
              ) : (
                <Button onClick={handleConfirm}>Confirm</Button>
              )}
            </div>
          )}
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
