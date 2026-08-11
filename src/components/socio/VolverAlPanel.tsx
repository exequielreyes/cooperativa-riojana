import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function VolverAlPanel() {
  return (
    <Link
      href="/portal"
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary"
    >
      <ArrowLeft size={16} />
      Volver
    </Link>
  );
}
