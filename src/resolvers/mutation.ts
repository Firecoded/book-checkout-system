import { MutationResolvers } from '../types/generated';
import {
  BookAlreadyCheckedOutError,
  BookNotCheckedOutError,
  BookNotFoundError,
  PersonNotFoundError,
} from '../errors';

export const Mutation: MutationResolvers = {
  checkOutBook: (_, { input: { bookId, personId } }, context) => {
    const book = context.dataSources.books.getById(bookId);
    if (!book) throw new BookNotFoundError(bookId);
    if (book.isCheckedOut) throw new BookAlreadyCheckedOutError(bookId);

    const person = context.dataSources.persons.getById(personId);
    if (!person) throw new PersonNotFoundError(personId);

    return context.dataSources.books.checkOut(bookId, personId);
  },

  returnBook: (_, { bookId }, context) => {
    const book = context.dataSources.books.getById(bookId);
    if (!book) throw new BookNotFoundError(bookId);
    if (!book.isCheckedOut) throw new BookNotCheckedOutError(bookId);

    return context.dataSources.books.return(bookId);
  },

  // Not required by spec — added to enable live demo data creation
  createBook: (_, { input: { title, author } }, context) => {
    return context.dataSources.books.create(title, author);
  },

  // Not required by spec — added to enable live demo data creation
  createPerson: (_, { input: { firstName, lastName, emailAddress, phoneNumber } }, context) => {
    return context.dataSources.persons.create(firstName, lastName, emailAddress, phoneNumber ?? null);
  },
};
