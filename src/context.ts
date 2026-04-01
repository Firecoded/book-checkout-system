import DataLoader from 'dataloader';
import { BookDataSource } from './datasources/BookDataSource';
import { PersonDataSource, PersonRecord } from './datasources/PersonDataSource';
import { createPersonLoader } from './loaders/personLoader';

/**
 * Context is created fresh per request by Apollo Server.
 * It carries the data sources and per-request DataLoader instances.
 * This mirrors the pattern used in production for injecting auth, DB connections, etc.
 */
export interface Context {
  dataSources: {
    books: BookDataSource;
    persons: PersonDataSource;
  };
  loaders: {
    person: DataLoader<string, PersonRecord | null>;
  };
}

export function createContext(): Context {
  const books = new BookDataSource();
  const persons = new PersonDataSource();
  return {
    dataSources: { books, persons },
    loaders: {
      person: createPersonLoader(persons),
    },
  };
}
