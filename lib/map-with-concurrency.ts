// Runs `fn` over `items` with at most `limit` calls in flight, preserving the
// input order in the result. Rejections propagate like Promise.all, so callers
// that need per-item failures should catch inside `fn`.
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  // Shared by all workers: each `next()` hands out the following item once.
  const entries = items.entries();

  const worker = async () => {
    for (let entry = entries.next(); !entry.done; entry = entries.next()) {
      const [index, item] = entry.value;
      results[index] = await fn(item, index);
    }
  };

  const workers = Array.from({ length: Math.min(Math.max(1, limit), items.length) }, worker);
  await Promise.all(workers);
  return results;
}
