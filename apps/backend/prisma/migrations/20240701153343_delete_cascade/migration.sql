-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_listId_fkey";

-- DropForeignKey
ALTER TABLE "List" DROP CONSTRAINT "List_boardId_fkey";

-- DropForeignKey
ALTER TABLE "UsersInBoards" DROP CONSTRAINT "UsersInBoards_boardId_fkey";

-- DropForeignKey
ALTER TABLE "UsersInBoards" DROP CONSTRAINT "UsersInBoards_userId_fkey";

-- AddForeignKey
ALTER TABLE "UsersInBoards" ADD CONSTRAINT "UsersInBoards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersInBoards" ADD CONSTRAINT "UsersInBoards_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE CASCADE ON UPDATE CASCADE;
