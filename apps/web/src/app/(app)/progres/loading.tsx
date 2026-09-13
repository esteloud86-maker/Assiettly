import { BlocSquelette } from "@/components/dashboard/primitives/Squelette";

export default function ChargementProgres() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-28 animate-pulse rounded-lg bg-creme-200/70" />
      <div className="grid grid-cols-2 gap-3">
        <BlocSquelette className="h-28" />
        <BlocSquelette className="h-28" />
      </div>
      <BlocSquelette className="h-48" />
      <BlocSquelette className="h-16" />
      <BlocSquelette className="h-24" />
      <BlocSquelette className="h-72" />
    </div>
  );
}
