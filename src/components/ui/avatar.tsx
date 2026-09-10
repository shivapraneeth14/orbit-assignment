import { cn, avatarInitials } from "@/lib/utils";

interface AvatarProps {
  name?: string | null;
  color?: string | null;
  className?: string;
}

export function Avatar({ name, color, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white",
        "ring-1 ring-ink/10 shadow-sm",
        className
      )}
      style={{ backgroundColor: color ?? "#3B4CFF" }}
      title={name ?? undefined}
    >
      {avatarInitials(name)}
    </div>
  );
}