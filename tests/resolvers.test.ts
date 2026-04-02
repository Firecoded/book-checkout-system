import { Query } from '../src/resolvers/query';
import { Mutation } from '../src/resolvers/mutation';
import { createContext, Context } from '../src/context';
import {
  BookNotFoundError,
  BookAlreadyCheckedOutError,
  BookNotCheckedOutError,
  PersonNotFoundError,
} from '../src/errors';
import { GraphQLResolveInfo } from 'graphql';
import { BookRecord } from '../src/datasources/BookDataSource';
import { PersonRecord } from '../src/datasources/PersonDataSource';

const info = {} as GraphQLResolveInfo;

// The codegen Resolver type is a union (ResolverFn | ResolverWithResolve) so TypeScript
// won't let us call it directly. This helper casts for test purposes only.
function callResolver<T>(fn: unknown, args: unknown, ctx: Context): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (fn as (p: any, a: any, c: any, i: any) => T)({}, args, ctx, info);
}

describe('Query: getAllBooks', () => {
  it('returns all seeded books', () => {
    const ctx = createContext();
    const books = callResolver<BookRecord[]>(Query.getAllBooks, {}, ctx);
    expect(books).toHaveLength(5);
  });
});

describe('Query: getBookForId', () => {
  it('returns the correct book by id', () => {
    const ctx = createContext();
    const book = callResolver<BookRecord>(Query.getBookForId, { bookId: 'book-1' }, ctx);
    expect(book.id).toBe('book-1');
    expect(book.title).toBe('The Great Gatsby');
  });

  it('throws BookNotFoundError for an unknown id', () => {
    const ctx = createContext();
    expect(() =>
      callResolver(Query.getBookForId, { bookId: 'does-not-exist' }, ctx),
    ).toThrow(BookNotFoundError);
  });
});

describe('Mutation: checkOutBook', () => {
  it('marks a book as checked out', () => {
    const ctx = createContext();
    const book = callResolver<BookRecord>(
      Mutation.checkOutBook,
      { input: { bookId: 'book-2', personId: 'person-1' } },
      ctx,
    );
    expect(book.isCheckedOut).toBe(true);
    expect(book.checkedOutByPersonId).toBe('person-1');
  });

  it('throws BookAlreadyCheckedOutError when book is already out', () => {
    const ctx = createContext();
    expect(() =>
      callResolver(Mutation.checkOutBook, { input: { bookId: 'book-1', personId: 'person-1' } }, ctx),
    ).toThrow(BookAlreadyCheckedOutError);
  });

  it('throws PersonNotFoundError for an unknown person', () => {
    const ctx = createContext();
    expect(() =>
      callResolver(Mutation.checkOutBook, { input: { bookId: 'book-4', personId: 'does-not-exist' } }, ctx),
    ).toThrow(PersonNotFoundError);
  });
});

describe('Mutation: returnBook', () => {
  it('marks a checked-out book as returned', () => {
    const ctx = createContext();
    const book = callResolver<BookRecord>(Mutation.returnBook, { bookId: 'book-1' }, ctx);
    expect(book.isCheckedOut).toBe(false);
    expect(book.checkedOutByPersonId).toBeNull();
  });

  it('throws BookNotCheckedOutError when book is already available', () => {
    const ctx = createContext();
    expect(() =>
      callResolver(Mutation.returnBook, { bookId: 'book-5' }, ctx),
    ).toThrow(BookNotCheckedOutError);
  });
});
