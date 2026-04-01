import { seedPersons } from './seed';

export interface PersonRecord {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string | null;
}

export class PersonDataSource {
  private persons: PersonRecord[];
  private nextId: number;

  constructor() {
    this.persons = seedPersons.map((p) => ({ ...p }));
    this.nextId = seedPersons.length + 1;
  }

  getById(id: string): PersonRecord | undefined {
    return this.persons.find((p) => p.id === id);
  }

  // Used by DataLoader to batch-fetch multiple persons in one call
  getByIds(ids: string[]): PersonRecord[] {
    return this.persons.filter((p) => ids.includes(p.id));
  }

  create(
    firstName: string,
    lastName: string,
    emailAddress: string,
    phoneNumber: string | null,
  ): PersonRecord {
    const person: PersonRecord = {
      id: `person-${this.nextId++}`,
      firstName,
      lastName,
      emailAddress,
      phoneNumber,
    };
    this.persons.push(person);
    return person;
  }
}
