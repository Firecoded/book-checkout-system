import { Resolvers } from '../types/generated';
import { Query } from './query';
import { Mutation } from './mutation';
import { Book } from './book';

export const resolvers: Resolvers = {
  Query,
  Mutation,
  Book,
};
