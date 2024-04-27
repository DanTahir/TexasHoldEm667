export interface ConstraintError extends Error {
  constraint?: string;
}
