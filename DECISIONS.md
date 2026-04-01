# Architecture & Decision Log

This document explains every significant decision made in this project — the what, the why, and what would change in a production system. It's intended as both a learning reference and interview preparation.

---

## 1. Why GraphQL over REST?

REST would work fine for this project, but GraphQL has advantages that are directly visible in this demo:

- **Selective fetching** — a REST `GET /books` endpoint always returns the full book object, including the person who checked it out. With GraphQL, the client declares exactly which fields it needs. The `getAllBooks` query can return books without person data, and `getBookForId` can include full person details — same endpoint, different payloads, no extra code needed on the server.
- **Self-documenting** — the schema IS the documentation. Apollo Sandbox reads the schema and generates interactive docs automatically.
- **Single endpoint** — all operations go to `POST /graphql`. No versioning, no managing a growing list of REST routes.

The tradeoff is complexity — GraphQL adds overhead for simple CRUD APIs. For a library system that might grow to support filtering, searching, recommendations etc., it's a good fit.

---

## 2. Apollo Server 5

Apollo Server is the most widely used GraphQL server for Node.js. Version 5 (released 2024) was chosen because:

- It's the current stable release with active support
- It removed the built-in landing page and many legacy dependencies, making it lighter and more standards-compliant
- Improved TypeScript types throughout

The key API used here is `startStandaloneServer` — a helper that wraps Apollo Server in a basic HTTP server. In production you'd use `expressMiddleware` instead to integrate with an existing Express app, add auth middleware, etc.

---

## 3. Schema-First (SDL) vs Code-First

There are two ways to define a GraphQL schema:

- **Schema-first**: write the schema in GraphQL SDL (`.graphql` file), then write resolvers to match it
- **Code-first**: write TypeScript classes/decorators and generate the schema from code (libraries: TypeGraphQL, Pothos)

This project uses **schema-first** because:

- The schema was provided as a specification — SDL is the natural fit
- SDL is the "source of truth" that anyone can read without knowing TypeScript
- It separates the API contract from the implementation

The downside of schema-first is that your resolver types can drift from your schema if you're not careful. That's exactly what **GraphQL Code Generator** solves (see Decision 7).

---

## 4. In-Memory Datastore

The spec explicitly says "datastore integration is not the focus." An in-memory JavaScript array is the right call here:

- Zero setup, works immediately
- The code that matters (resolvers, schema, DataLoader) is not obscured by DB boilerplate
- Data resets on restart, which is fine for a demo

**What would change in production:**
Replace `BookDataSource` and `PersonDataSource` with real data access layers — e.g., a Prisma client, a Mongoose model, or a plain SQL query. The resolver code wouldn't change at all because resolvers only call methods on the data source (`context.dataSources.books.getAll()`). This separation of concerns is intentional.

---

## 5. DataLoader — The N+1 Problem

This is one of the most important GraphQL-specific concepts.

**The problem:** Imagine `getAllBooks` returns 100 books. If 50 of them are checked out, GraphQL will call the `checkedOutBy` field resolver 50 times — once per book. If each call hits a database, that's 50 separate queries. This is the **N+1 problem** (1 query to get the list + N queries for each item's related data).

**How DataLoader solves it:** DataLoader batches all the individual lookups that happen within a single "tick" of the event loop. Instead of 50 separate calls to fetch person data, DataLoader collects all 50 person IDs and makes **one** call to `getByIds`. It then maps the results back to each original request.

**In this project:** The `checkedOutBy` resolver on the `Book` type calls `context.loaders.person.load(personId)` instead of `context.dataSources.persons.getById(personId)`. The loader is backed by `getByIds`.

**Why create a new DataLoader per request?** DataLoader caches results within a request. If you reuse the same loader across requests, User A's request could return cached data intended for User B. By creating the loader in `createContext()` (which Apollo calls per request), we get a fresh cache every time.

**With in-memory data** the performance benefit isn't visible, but the pattern is identical to what you'd use with a real database. This is worth mentioning in the demo.

---

## 6. Custom GraphQL Errors

GraphQL has its own error model that differs from REST:

- In REST, an error returns a non-200 HTTP status code with an error body
- In GraphQL, **errors always return HTTP 200** with an `errors` array alongside the `data` in the response

Example response when a book isn't found:
```json
{
  "data": null,
  "errors": [
    {
      "message": "Book not found: book-999",
      "extensions": {
        "code": "BOOK_NOT_FOUND"
      }
    }
  ]
}
```

The `extensions.code` field is a machine-readable error code that clients can switch on. The four custom errors in this project are:

| Class | Code | When |
|---|---|---|
| `BookNotFoundError` | `BOOK_NOT_FOUND` | `getBookForId`, `checkOutBook`, `returnBook` with unknown ID |
| `BookAlreadyCheckedOutError` | `BOOK_ALREADY_CHECKED_OUT` | `checkOutBook` on a book that's already out |
| `BookNotCheckedOutError` | `BOOK_NOT_CHECKED_OUT` | `returnBook` on a book that's already available |
| `PersonNotFoundError` | `PERSON_NOT_FOUND` | `checkOutBook` with unknown person ID |

All extend `GraphQLError` from the `graphql` package. Apollo Server catches these and formats them correctly.

---

## 7. GraphQL Code Generator

Without tooling, you'd write TypeScript types for your schema manually and keep them in sync by hand — tedious and error-prone.

GraphQL Code Generator reads the SDL schema and generates TypeScript types automatically. The key output is **resolver types** — functions typed with the exact argument shapes GraphQL will pass them.

**Configuration** (`codegen.yml`):
- `contextType` — tells codegen that resolver context is our `Context` interface, so resolvers are fully typed against our actual data sources and loaders
- `mappers` — tells codegen that when GraphQL talks about a `Book`, the underlying data object is actually a `BookRecord`. This is crucial because our `BookRecord` has `checkedOutByPersonId: string | null` internally, while the GraphQL `Book` type has `checkedOutBy: Person`. The mapper lets the type system understand that mismatch.

Run with: `npm run generate`. The output goes to `src/types/generated.ts` — don't edit it manually.

---

## 8. Input Types for Mutations

The spec defines `checkOutBook(bookId: ID!, personId: ID!)` with flat arguments. This project wraps them in an **input type**:

```graphql
input CheckOutBookInput {
  bookId: ID!
  personId: ID!
}

checkOutBook(input: CheckOutBookInput!): Book!
```

**Why:**
- Input types are reusable — if another mutation needs the same shape, you don't repeat it
- Easier to extend — adding a new field to `CheckOutBookInput` doesn't change the mutation signature
- Convention — most production GraphQL APIs use input types for mutations with more than one argument

`returnBook(bookId: ID!)` keeps a flat argument because it only has one — input types are less useful there.

---

## 9. Context Object

Apollo Server's `context` is a plain object created fresh for each request. It's passed to every resolver as the third argument.

This project puts two things in context:
- `dataSources` — the data layer instances (`BookDataSource`, `PersonDataSource`)
- `loaders` — the per-request DataLoader instances

**Why not just import the data sources directly into resolvers?**

If resolvers imported data sources at the module level, the data sources would be singletons — shared across all requests. That's fine for in-memory data but wrong for anything stateful (database connections, auth tokens). Using context:
- Keeps resolvers pure (they receive everything they need as arguments)
- Makes testing easier (inject a mock context)
- Mirrors how production apps handle auth — you decode the token in the context function and attach the user to context, then resolvers check `context.user`

---

## 10. Resolver Organisation

Resolvers are split into three files:

- `query.ts` — `getAllBooks`, `getBookForId`
- `mutation.ts` — `checkOutBook`, `returnBook`, `createBook`, `createPerson`
- `book.ts` — the `checkedOutBy` field resolver on the `Book` type

The `book.ts` file is important to understand. In GraphQL, you can write field-level resolvers for any type — not just queries and mutations. When Apollo resolves the `Book.checkedOutBy` field, it calls the resolver in `book.ts` with the `BookRecord` as the parent. This is where DataLoader is invoked.

Without `book.ts`, `checkedOutBy` would default to returning `bookRecord.checkedOutBy` — but `BookRecord` doesn't have that property (it has `checkedOutByPersonId`). The field resolver bridges the gap.

---

## 11. Extra Mutations: createBook / createPerson

The spec doesn't require these. They were added for two reasons:

1. **Demo flexibility** — being able to create data live during the demo is more compelling than only working with pre-seeded records
2. **Completeness** — a real library API would need ways to add books and register patrons

Both mutations are clearly marked with a schema comment (`Not required by spec`) and in the resolver code, so it's transparent that they're additions.

---

## 12. What Would Change in Production

| Concern | This Project | Production |
|---|---|---|
| Datastore | In-memory arrays | PostgreSQL/MongoDB + ORM |
| Authentication | None | JWT in context, `@auth` directive on fields |
| Persistence | Wiped on restart | Persistent DB with migrations |
| Pagination | None | Cursor-based pagination on `getAllBooks` |
| Input validation | Basic (null checks) | Zod or class-validator |
| Error handling | 4 custom errors | Centralised error handling plugin |
| Logging | None | Apollo plugin + structured logging |
| Schema | Monolithic | Federated (Apollo Federation) for large teams |
| Testing | Unit tests on resolvers | + Integration tests against a test DB |
