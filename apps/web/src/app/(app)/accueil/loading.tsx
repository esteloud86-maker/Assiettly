import { BlocSquelette } from "@/components/dashboard/primitives/Squelette";

export default function ChargementAccueil() {
  return (
    <div className="space-y-6">
      <BlocSquelette className="h-14" />
      <BlocSquelette className="h-36" />
      <div className="grid grid-cols-3 gap-3">
        <BlocSquelette className="h-24" />
        <BlocSquelette className="h-24" />
        <BlocSquelette className="h-24" />
      </div>
      <div className="space-y-2">
        <div className="h-6 w-40 animate-pulse rounded-lg bg-creme-200/70" />
        <BlocSquelette className="h-20" />
        <BlocSquelette className="h-20" />
      </div>
    </div>
  );
}
