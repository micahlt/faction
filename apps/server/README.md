# Faction Server

An Express and Socket.io-based server for Faction

## Running the server

You can run the app from the `/apps/server` folder by running `npm run start`. Alternatively, run `npm run dev:server` from the root of the repository.

## Database migrations

To avoid paying for a database in the future, we're actually switching to Prisma + SQLite. This is the best of both worlds because it allows us to switch out DB backends if necessary without writing extra code. It also lets you access the db without writing raw SQL queries.

Every time you pull new commits from the repository, you should run `npm run db:migrate` to make sure the database is up-to-date with the latest changes. If you run into migration errors, you can always run `npm run db:reset` to clear out the database and start over. This WILL wipe all of the data in your db.

When you modify the database schema (`schema.prisma`), make sure you add a migration with `npm run db:migrate <short-description-of-changes>`. This will let other teammates' machines get your strucutral changes.

## Folder structure

- **controllers**: logic
- **middleware**: mostly for authentication
- **prisma**: database stuff
  - **migrations**: database migrations (incremental updates)
- **routes**: REST route definitions
