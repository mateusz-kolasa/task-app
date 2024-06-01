import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsStrongPassword, MaxLength } from 'class-validator'
import { MAX_LOGIN_LENGTH, MAX_PASSWORD_LENGTH } from 'src/consts/user.consts'

export default class UserRegisterData {
  @IsString()
  @MaxLength(MAX_LOGIN_LENGTH)
  @ApiProperty()
  username: string

  @IsString()
  @MaxLength(MAX_PASSWORD_LENGTH)
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @ApiProperty()
  password: string
}
