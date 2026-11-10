import Image from "next/image";

type EmptyStateIllustrationProps = {
  alt: string;
  className?: string;
};

export function EmptyStateIllustration({
  alt,
  className = "mx-auto h-20 w-24 object-contain",
}: EmptyStateIllustrationProps) {
  return (
    <Image
      src="/assets/empty-workspace.svg"
      alt={alt}
      width={144}
      height={112}
      className={className}
    />
  );
}
