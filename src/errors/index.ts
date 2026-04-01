import { GraphQLError } from 'graphql';

export class BookNotFoundError extends GraphQLError {
  constructor(bookId: string) {
    super(`Book not found: ${bookId}`, {
      extensions: { code: 'BOOK_NOT_FOUND' },
    });
  }
}

export class BookAlreadyCheckedOutError extends GraphQLError {
  constructor(bookId: string) {
    super(`Book is already checked out: ${bookId}`, {
      extensions: { code: 'BOOK_ALREADY_CHECKED_OUT' },
    });
  }
}

export class BookNotCheckedOutError extends GraphQLError {
  constructor(bookId: string) {
    super(`Book is not currently checked out: ${bookId}`, {
      extensions: { code: 'BOOK_NOT_CHECKED_OUT' },
    });
  }
}

export class PersonNotFoundError extends GraphQLError {
  constructor(personId: string) {
    super(`Person not found: ${personId}`, {
      extensions: { code: 'PERSON_NOT_FOUND' },
    });
  }
}
