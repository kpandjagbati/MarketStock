-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "beneficiary" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "reason" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Association" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "defaultMinQuantity" INTEGER NOT NULL DEFAULT 5
);
INSERT INTO "new_Association" ("email", "id", "name") SELECT "email", "id", "name" FROM "Association";
DROP TABLE "Association";
ALTER TABLE "new_Association" RENAME TO "Association";
CREATE UNIQUE INDEX "Association_email_key" ON "Association"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
