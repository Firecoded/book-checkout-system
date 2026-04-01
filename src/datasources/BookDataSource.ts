import { seedBooks } from './seed';

export interface BookRecord {
  id: string;
  title: string;
  author: string;
  isCheckedOut: boolean;
  checkedOutByPersonId: string | null;
}

export class BookDataSource {
  private books: BookRecord[];
  private nextId: number;

  constructor() {
    this.books = seedBooks.map((b) => ({ ...b })); // shallow copy so each instance is independent
    this.nextId = seedBooks.length + 1;
  }

  getAll(): BookRecord[] {
    return this.books;
  }

  getById(id: string): BookRecord | undefined {
    return this.books.find((b) => b.id === id);
  }

  checkOut(bookId: string, personId: string): BookRecord {
    const book = this.getById(bookId)!;
    book.isCheckedOut = true;
    book.checkedOutByPersonId = personId;
    return book;
  }

  return(bookId: string): BookRecord {
    const book = this.getById(bookId)!;
    book.isCheckedOut = false;
    book.checkedOutByPersonId = null;
    return book;
  }

  create(title: string, author: string): BookRecord {
    const book: BookRecord = {
      id: `book-${this.nextId++}`,
      title,
      author,
      isCheckedOut: false,
      checkedOutByPersonId: null,
    };
    this.books.push(book);
    return book;
  }
}
