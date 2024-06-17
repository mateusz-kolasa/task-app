import { User } from './prisma-import'

export interface UserInfoData extends Omit<User, 'passwordHash'> {}
