import type { ReactNode } from "react";

interface KeyHintProps {
  readonly children: ReactNode;
  readonly wide?: boolean;
}

export function KeyHint({ children, wide = false }: KeyHintProps) {
  return <kbd className={wide ? "key-hint is-wide" : "key-hint"}>{children}</kbd>;
}
