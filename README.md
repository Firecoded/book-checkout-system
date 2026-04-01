# Library GraphQL API

An Apollo GraphQL server that acts as the backend for a library book checkout system. Built with TypeScript, Apollo Server 4, and DataLoader.

## Stack

- **Apollo Server 5** — GraphQL server
- **TypeScript** — full type safety throughout
- **DataLoader** — batches `checkedOutBy` lookups to prevent N+1 queries
- **GraphQL Code Generator** — generates TypeScript types from the SDL schema
- **Jest + ts-jest** — unit tests

## Getting Started

**Prerequisites:** Node 18+

```bash
# Install dependencies
npm install

# Start the dev server (with hot reload)
npm run dev
```

Server runs at **http://localhost:4000** — open it in a browser to access Apollo Sandbox.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm test` | Run tests |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output |
| `npm run generate` | Regenerate TypeScript types from schema |
| `npm run lint` | Lint source files |

## Schema

### Types

```graphql
type Book {
  id: ID!
  title: String!
  author: String!
  isCheckedOut: Boolean!
  checkedOutBy: Person       # null when book is available
}

type Person {
  id: ID!
  firstName: String!
  lastName: String!
  emailAddress: String!
  phoneNumber: String        # nullable — not everyone provides one
}
```

### Queries

```graphql
getAllBooks: [Book!]!
getBookForId(bookId: ID!): Book!
```

### Mutations

```graphql
checkOutBook(input: CheckOutBookInput!): Book!
returnBook(bookId: ID!): Book!

# Not required by spec — added for live demo data creation
createBook(input: CreateBookInput!): Book!
createPerson(input: CreatePersonInput!): Person!
```

## Seeded Data

The server starts with pre-loaded data so the demo works immediately:

**Books**
| ID | Title | Checked Out By |
|---|---|---|
| book-1 | The Great Gatsby | Alice Johnson (person-1) |
| book-2 | To Kill a Mockingbird | — |
| book-3 | 1984 | Bob Martinez (person-2) |
| book-4 | Pride and Prejudice | — |
| book-5 | The Catcher in the Rye | — |

**Persons**
| ID | Name | Email |
|---|---|---|
| person-1 | Alice Johnson | alice.johnson@example.com |
| person-2 | Bob Martinez | bob.martinez@example.com |
| person-3 | Carol White | carol.white@example.com |

> Data resets when the server restarts (in-memory store).

## Running the Demo

Pre-written queries for all demo scenarios are in [`demo-queries.graphql`](./demo-queries.graphql). Open Apollo Sandbox at http://localhost:4000 and paste them in.

**Suggested demo order:**
1. `GetAllBooks` — show books without person data (selective fetching)
2. `GetCheckedOutBook` — show book-1 with full person details
3. `CheckOutBook` — check out book-2 to person-3
4. `ReturnBook` — return book-1
5. Error cases — `CheckOutAlreadyCheckedOut`, `GetUnknownBook`

## Project Structure

```
src/
  schema/         SDL type definitions + schema loader
  datasources/    In-memory data layer (BookDataSource, PersonDataSource, seed data)
  resolvers/      Query, Mutation, and Book field resolvers
  loaders/        DataLoader factory for batched person lookups
  errors/         Custom GraphQL error classes
  types/          Codegen-generated TypeScript types (auto-generated, do not edit)
  context.ts      Per-request context (data sources + loaders)
  server.ts       Apollo Server setup
  index.ts        Entry point
tests/
  resolvers.test.ts
```

## Architecture Decisions

See [DECISIONS.md](./DECISIONS.md) for a detailed explanation of every architectural choice made in this project.
