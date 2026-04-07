import type { HeadingBlock } from '@/types/block';

export function HeadingViewer({ block }: { block: HeadingBlock }) {
  const { text, level } = block.content;
  const sizeClass =
    level === 1
      ? 'text-2xl font-bold'
      : level === 2
        ? 'text-xl font-semibold'
        : 'text-lg font-medium';

  if (level === 1) return <h1 className={sizeClass}>{text}</h1>;
  if (level === 2) return <h2 className={sizeClass}>{text}</h2>;
  return <h3 className={sizeClass}>{text}</h3>;
}
