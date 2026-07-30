interface NametrisMarkProps {
  readonly compact?: boolean;
}

export function NametrisMark({ compact = false }: NametrisMarkProps) {
  return (
    <span
      className={compact ? "nametris-mark is-compact" : "nametris-mark"}
      aria-hidden="true"
    >
      <span className="nametris-mark-block is-lime" />
      <span className="nametris-mark-block is-red" />
      <span className="nametris-mark-block is-yellow" />
      <span className="nametris-mark-block is-blue" />
    </span>
  );
}
