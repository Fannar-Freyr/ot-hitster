export default function TeamCard({ name }: { name: string }) {
  return (
    <div className="m-4 py-2 px-3 bg-slate-50 text-slate-900 rounded-xl text-2xl">
      {name}
    </div>
  );
}
