interface handProps {
  children: React.ReactNode;
}

export default function Hand({ children }: handProps) {
  return (
    <div className="flex space-y-2 flex-col w-full" style={{ touchAction: 'none' }}>
      {children}
    </div>
  );
}
