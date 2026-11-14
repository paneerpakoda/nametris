export type NameValidationResult =
  | { readonly valid: true; readonly name: string }
  | { readonly valid: false; readonly message: string };

export const nameLengthLimit = 5;
export const nameRuleMessage = `Letters A-Z only (2-${nameLengthLimit})`;
export const lettersOnlyAlert = "Letters A-Z only";
export const nameTooLongMessage = `Maximum ${nameLengthLimit} letters`;
export const playerNamePattern = new RegExp(`^[A-Z]{2,${nameLengthLimit}}$`);
export const describedNamePattern = new RegExp(`^[A-Z]{1,${nameLengthLimit}}$`);

export function lettersOnlyName(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, nameLengthLimit);
}

export function validatePlayerName(input: string): NameValidationResult {
  const name = input.trim().toUpperCase();

  if (!playerNamePattern.test(name)) {
    return { valid: false, message: nameRuleMessage };
  }

  return { valid: true, name };
}
