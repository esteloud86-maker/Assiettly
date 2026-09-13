import { BlocSquelette } from "@/components/dashboard/primitives/Squelette";

export default function ChargementJournal() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-creme-200/70" />
        <div className="h-5 w-32 animate-pulse rounded bg-creme-200/70" />
      </div>
      <div className="space-y-3">
        <BlocSquelette className="h-24" />
        <BlocSquelette className="h-24" />
        <BlocSquelette className="h-24" />
      </div>
    </div>
  );
}
