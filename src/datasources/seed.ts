import { BookRecord } from './BookDataSource';
import { PersonRecord } from './PersonDataSource';

export const seedPersons: PersonRecord[] = [
  {
    id: 'person-1',
    firstName: 'Alice',
    lastName: 'Johnson',
    emailAddress: 'alice.johnson@example.com',
    phoneNumber: '555-0101',
  },
  {
    id: 'person-2',
    firstName: 'Bob',
    lastName: 'Martinez',
    emailAddress: 'bob.martinez@example.com',
    phoneNumber: '555-0102',
  },
  {
    id: 'person-3',
    firstName: 'Carol',
    lastName: 'White',
    emailAddress: 'carol.white@example.com',
    phoneNumber: null, // phoneNumber is intentionally nullable per the schema
  },
];

export const seedBooks: BookRecord[] = [
  {
    id: 'book-1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isCheckedOut: true,
    checkedOutByPersonId: 'person-1',
  },
  {
    id: 'book-2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isCheckedOut: false,
    checkedOutByPersonId: null,
  },
  {
    id: 'book-3',
    title: '1984',
    author: 'George Orwell',
    isCheckedOut: true,
    checkedOutByPersonId: 'person-2',
  },
  {
    id: 'book-4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isCheckedOut: false,
    checkedOutByPersonId: null,
  },
  {
    id: 'book-5',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    isCheckedOut: false,
    checkedOutByPersonId: null,
  },
];
