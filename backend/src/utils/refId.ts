/** Resolve a Mongo ref that may be an ObjectId or a populated document. */
export function refId(value: unknown): string {
  if (value && typeof value === 'object' && '_id' in (value as object)) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}
