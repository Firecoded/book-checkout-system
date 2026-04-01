import DataLoader from 'dataloader';
import { PersonDataSource, PersonRecord } from '../datasources/PersonDataSource';

/**
 * DataLoader batches all person lookups that happen within a single request tick
 * into a single getByIds call, preventing the N+1 problem.
 *
 * A new loader instance is created per request (in createContext) so the cache
 * never bleeds between requests.
 */
export function createPersonLoader(
  persons: PersonDataSource,
): DataLoader<string, PersonRecord | null> {
  return new DataLoader<string, PersonRecord | null>(async (ids) => {
    const records = persons.getByIds([...ids]);
    // DataLoader requires the returned array to be in the same order as the input keys
    return ids.map((id) => records.find((p) => p.id === id) ?? null);
  });
}
