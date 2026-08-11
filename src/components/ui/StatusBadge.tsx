import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "neutral";

export function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  const tones: Record<Tone, string> = {
    success: "badge-success",
    warning: "badge-warning",
    danger: "badge-danger",
    neutral: "badge bg-gray-100 text-gray-500",
  };

  return (
    <span className={cn(tones[tone])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
