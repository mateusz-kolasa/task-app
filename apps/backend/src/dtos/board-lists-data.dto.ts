import { Prisma } from '@prisma/client'

const boardWithLists = Prisma.validator<Prisma.BoardDefaultArgs>()({
  include: { lists: true },
})

export type BoardWithListsData = Prisma.BoardGetPayload<typeof boardWithLists>
