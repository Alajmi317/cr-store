import Image from "next/image";

export function Logo({ size = 44, withText = false, name = "CR Store" }: { size?: number; withText?: boolean; name?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Image
        src="/brand/logo.png"
        alt={name}
        width={size}
        height={size}
        priority
        className="rounded-full"
      />
      {withText ? (
        <span className="display text-lg font-semibold tracking-[0.18em] text-zinc-100">{name}</span>
      ) : null}
    </span>
  );
}
