export type NameValidationResult =
  | { readonly valid: true; readonly name: string }
  | { readonly valid: false; readonly message: string };

export const nameRuleMessage = "Letters A-Z only (2-10)";
export const nameLengthLimit = 10;

export function lettersOnlyName(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, nameLengthLimit);
}

export function validatePlayerName(input: string): NameValidationResult {
  const name = lettersOnlyName(input);

  if (!/^[A-Z]{2,10}$/.test(name)) {
    return { valid: false, message: nameRuleMessage };
  }

  return { valid: true, name };
}
