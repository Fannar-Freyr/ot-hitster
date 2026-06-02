/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { supabase } from '@/utils/db/supabase';
import Button from '@/components/Button';

export default function LobbyPlayer({
  gameId,
  playerId,
}: {
  gameId: string;
  playerId: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">{'Waiting for the DJ'}</h1>
      <Button
        onClick={() => {
          supabase.channel(`lobby-screen-${gameId}`).send({
            type: 'broadcast',
            event: 'pressed_it',
            payload: { playerId: playerId },
          });
        }}
      >
        {'Do not press'}
      </Button>
    </div>
  );
}
