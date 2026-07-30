export type NameValidationResult =
  | { readonly valid: true; readonly name: string }
  | { readonly valid: false; readonly message: string };

const invalidNameMessage = "Use 2–10 English letters without spaces or symbols.";

export function validatePlayerName(input: string): NameValidationResult {
  const trimmed = input.trim();

  if (trimmed === "") {
    return { valid: true, name: "HARSH" };
  }

  const normalized = trimmed.toUpperCase();
  if (!/^[A-Z]{2,10}$/.test(normalized)) {
    return { valid: false, message: invalidNameMessage };
  }

  return { valid: true, name: normalized };
}
