-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Faction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "iconUrl" TEXT,
    "ownerId" TEXT NOT NULL
);
INSERT INTO "new_Faction" ("iconUrl", "id", "name", "ownerId") SELECT "iconUrl", "id", "name", "ownerId" FROM "Faction";
DROP TABLE "Faction";
ALTER TABLE "new_Faction" RENAME TO "Faction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
