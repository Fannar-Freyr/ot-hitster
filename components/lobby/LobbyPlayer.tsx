/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { supabase } from '@/utils/db/supabase';
import Button from '@/components/Button';
import EmojiPicker from '@/components/EmojiPicker';
import { useEmojiSender } from '@/hooks/useEmojiSender';

export default function LobbyPlayer({
  gameId,
  playerId,
}: {
  gameId: string;
  playerId: string;
}) {
  const { sendEmoji } = useEmojiSender({
    channelName: `lobby-screen-${gameId}`,
    playerId,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">{'Waiting for the DJ'}</h1>
      <EmojiPicker onEmojiSelect={sendEmoji} className="mt-10" />
    </div>
  );
}
