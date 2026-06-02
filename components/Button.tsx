import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const buttonStyle =
  'bg-slate-50 text-slate-900 m-4 rounded-xl px-4 py-2 text-xl cursor-pointer select-none transition-colors duration-300 hover:bg-slate-200';

export default function Button({
  children,
  href,
  onClick,
  className,
  disabled,
}: ButtonProps): React.JSX.Element {
  if (href) {
    return (
      <Link href={href}>
        <div className={`${buttonStyle} ${className ?? ''}`} onClick={onClick}>
          {children}
        </div>
      </Link>
    );
  }

  return (
    <div
      className={`${buttonStyle} ${className ?? ''} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </div>
  );
}
