import { useSortable } from '@dnd-kit/react/sortable';
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers';

interface CardProps {
  title?: string;
  artist?: string;
  year: number;
  emptyCard?: boolean;
  id: string;
  index: number;
}

export default function Card({ title, artist, year, emptyCard, id, index }: CardProps) {
  const { ref } = useSortable({
    id,
    index,
    data: {
      disabled: !emptyCard,
      year: year ?? 0,
    },
    modifiers: [RestrictToVerticalAxis],
    transition: {
      duration: 300,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  });

  const colors = [
    'bg-red-300',
    'bg-blue-300',
    'bg-green-300',
    'bg-yellow-300',
    'bg-purple-300',
    'bg-pink-300',
    'bg-indigo-300',
    'bg-fuchsia-300',
    'bg-rose-300',
  ];

  const backgroundColor = emptyCard ? 'bg-black' : colors[year % colors.length]; //getColor(title ?? 'hash', colors);
  const textColor = emptyCard ? 'text-white' : 'text-black';

  return (
    <div
      className={`${backgroundColor} ${textColor} rounded-sm min-h-16 flex flex-row flex-1 items-center justify-between py-2 px-4`}
      style={{ touchAction: 'none' }}
      ref={ref}
    >
      {emptyCard ? (
        <>
          <div className="text-lg font-bold ">Place your guess</div>
          <div className="text-3xl font-bold text-center ">{title}</div>
        </>
      ) : (
        <>
          <div>
            <div className="text-lg font-bold ">{artist}</div>
            <div className="text-md">{emptyCard ? '' : title}</div>
          </div>
          <div className="text-3xl font-bold text-center ">{year}</div>
        </>
      )}
    </div>
  );
}

function getColor(title: string, colors: string[]) {
  let hash = 2166136261;
  for (let i = 0; i < title.length; i++) {
    hash ^= title.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  // Ensure the hash is positive and within array bounds
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

const colors = ['red', 'blue', 'green', 'yellow'];
console.log(getColor('Hello World', colors)); // Always returns "blue"
