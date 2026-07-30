import { getPieceOffsets } from "../engine/pieces";
import type { Cell, PieceType, Rotation } from "../model/types";
import { stencilCellKey } from "./alphabet";

const pieceTypes: readonly PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];
const rotations: readonly Rotation[] = [0, 1, 2, 3];
const neighborOffsets: readonly Cell[] = [
  { row: -1, column: 0 },
  { row: 1, column: 0 },
  { row: 0, column: -1 },
  { row: 0, column: 1 },
];

function parseCellKey(key: string): Cell {
  const [rowText, columnText] = key.split(":");
  return { row: Number(rowText), column: Number(columnText) };
}

function normalizedShape(type: PieceType, rotation: Rotation): readonly Cell[] {
  const offsets = getPieceOffsets(type, rotation);
  const minimumRow = Math.min(...offsets.map(({ row }) => row));
  const minimumColumn = Math.min(...offsets.map(({ column }) => column));
  return offsets.map(({ row, column }) => ({
    row: row - minimumRow,
    column: column - minimumColumn,
  }));
}

const uniqueShapes: readonly (readonly Cell[])[] = [
  ...new Map(
    pieceTypes.flatMap((type) =>
      rotations.map((rotation) => {
        const shape = normalizedShape(type, rotation);
        const key = shape.map(stencilCellKey).sort().join("|");
        return [key, shape] as const;
      }),
    ),
  ).values(),
];

function getComponents(cells: ReadonlySet<string>): readonly ReadonlySet<string>[] {
  const unseen = new Set(cells);
  const components: Set<string>[] = [];

  while (unseen.size > 0) {
    const start = unseen.values().next().value;
    if (start === undefined) {
      break;
    }

    const component = new Set<string>([start]);
    const pending = [start];
    unseen.delete(start);

    while (pending.length > 0) {
      const currentKey = pending.pop();
      if (currentKey === undefined) {
        continue;
      }
      const current = parseCellKey(currentKey);

      for (const offset of neighborOffsets) {
        const neighborKey = stencilCellKey({
          row: current.row + offset.row,
          column: current.column + offset.column,
        });
        if (unseen.delete(neighborKey)) {
          component.add(neighborKey);
          pending.push(neighborKey);
        }
      }
    }

    components.push(component);
  }

  return components;
}

function placementsContaining(
  selectedKey: string,
  remaining: ReadonlySet<string>,
): readonly (readonly string[])[] {
  const selected = parseCellKey(selectedKey);
  const placements = new Map<string, readonly string[]>();

  for (const shape of uniqueShapes) {
    for (const anchor of shape) {
      const origin = {
        row: selected.row - anchor.row,
        column: selected.column - anchor.column,
      };
      const placement = shape.map((offset) =>
        stencilCellKey({
          row: origin.row + offset.row,
          column: origin.column + offset.column,
        }),
      );

      if (placement.every((key) => remaining.has(key))) {
        const placementKey = [...placement].sort().join("|");
        placements.set(placementKey, placement);
      }
    }
  }

  return [...placements.values()];
}

function solveComponent(
  remaining: ReadonlySet<string>,
  failedStates: Set<string>,
): boolean {
  if (remaining.size === 0) {
    return true;
  }
  if (
    remaining.size % 4 !== 0 ||
    getComponents(remaining).some((component) => component.size % 4 !== 0)
  ) {
    return false;
  }

  const stateKey = [...remaining].sort().join("|");
  if (failedStates.has(stateKey)) {
    return false;
  }

  let bestPlacements: readonly (readonly string[])[] | null = null;
  for (const key of remaining) {
    const placements = placementsContaining(key, remaining);
    if (placements.length === 0) {
      failedStates.add(stateKey);
      return false;
    }
    if (bestPlacements === null || placements.length < bestPlacements.length) {
      bestPlacements = placements;
    }
  }

  for (const placement of bestPlacements ?? []) {
    const next = new Set(remaining);
    placement.forEach((key) => next.delete(key));
    if (solveComponent(next, failedStates)) {
      return true;
    }
  }

  failedStates.add(stateKey);
  return false;
}

export function isMaskTileable(mask: ReadonlySet<string>): boolean {
  return (
    mask.size > 0 &&
    mask.size % 4 === 0 &&
    getComponents(mask).every(
      (component) =>
        component.size % 4 === 0 && solveComponent(component, new Set<string>()),
    )
  );
}
