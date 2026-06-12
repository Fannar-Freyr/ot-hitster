'use client';

const EMOJIS = ['🎵', '🔥', '😍', '👏', '🎉', '🤘'];

export default function EmojiPicker({
  onEmojiSelect,
  className,
}: {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-2 justify-center ${className ?? ''}`}>
      {EMOJIS.map(emoji => (
        <button
          key={emoji}
          onClick={() => onEmojiSelect(emoji)}
          className="text-5xl active:scale-110 bg-white transition-transform duration-80 select-none cursor-pointer p-5 rounded-lg"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
