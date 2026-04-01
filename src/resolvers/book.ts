import { BookResolvers } from '../types/generated';

/**
 * Field-level resolvers for the Book type.
 * checkedOutBy uses DataLoader to batch person lookups across all books
 * in a single request, preventing the N+1 query problem.
 */
export const Book: BookResolvers = {
  checkedOutBy: (parent, _, context) => {
    if (!parent.checkedOutByPersonId) return null;
    return context.loaders.person.load(parent.checkedOutByPersonId);
  },
};
