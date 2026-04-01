import { QueryResolvers } from '../types/generated';
import { BookNotFoundError } from '../errors';

export const Query: QueryResolvers = {
  getAllBooks: (_, __, context) => {
    return context.dataSources.books.getAll();
  },

  getBookForId: (_, { bookId }, context) => {
    const book = context.dataSources.books.getById(bookId);
    if (!book) throw new BookNotFoundError(bookId);
    return book;
  },
};
