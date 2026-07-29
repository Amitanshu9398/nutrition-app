import { MessageCircle } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function WhatsAppButton({ className, label = "Message on WhatsApp" }: { className?: string; label?: string }) {
  return (
    <a
      href={BRAND.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}
