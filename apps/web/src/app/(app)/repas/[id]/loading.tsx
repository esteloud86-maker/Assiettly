import { BlocSquelette } from "@/components/dashboard/primitives/Squelette";

export default function ChargementDetailRepas() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-40 animate-pulse rounded-lg bg-creme-200/70" />
      <BlocSquelette className="h-40" />
      <BlocSquelette className="h-24" />
      <BlocSquelette className="h-32" />
    </div>
  );
}
