import { Fragment } from "react";

import { KeyHint } from "./KeyHint";

interface ShortcutLabelProps {
  readonly label: string;
  readonly keys: readonly string[];
}

export function ShortcutLabel({ label, keys }: ShortcutLabelProps) {
  return (
    <>
      <span className="shortcut-label">{label}</span>
      <span className="shortcut-keys">
        {keys.map((key, index) => (
          <Fragment key={key}>
            {index > 0 ? " " : null}
            <KeyHint wide={key.length > 3}>{key}</KeyHint>
          </Fragment>
        ))}
      </span>
    </>
  );
}
