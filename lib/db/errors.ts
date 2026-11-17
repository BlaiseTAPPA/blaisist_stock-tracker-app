/**
 * True for a MongoDB unique-index violation (E11000). Checks the code rather
 * than `instanceof MongoServerError`: Mongoose may bundle its own copy of the
 * driver, so the class identity is not reliable.
 */
export function isDuplicateKeyError(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && e.code === 11000;
}
