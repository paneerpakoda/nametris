export const playerTitles = {
  stencilSorcerer: "Stencil Sorcerer",
  turboTypesetter: "Turbo Typesetter",
  lineDanceLegend: "Line-Dance Legend",
  shapeWhisperer: "Shape Whisperer",
  blockPoet: "Block-Poet",
  oneHundredWonder: "The One-Hundred Wonder",
  pixelPerfectAlchemist: "Pixel-Perfect Name Alchemist",
  crownedBlocksmith: "Crowned Blocksmith",
} as const;

export type PlayerTitle = (typeof playerTitles)[keyof typeof playerTitles];

export const titleThresholds = {
  sorcererCompletion: 0.95,
  regularSecondsPerPiece: 15,
  regularScorePerLine: 450,
  placementEfficiency: 0.8,
  distinctPieceTypes: 6,
  perfectSecondsPerPiece: 13,
  perfectScorePerLine: 550,
} as const;
