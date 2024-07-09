import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString, Max, MaxLength, Min, MinLength } from 'class-validator'
import { MAX_LOGIN_LENGTH } from 'shared-consts'

export default class BoardAddUserData {
  @IsNumber()
  @ApiProperty()
  boardId: number

  @IsString()
  @MinLength(1)
  @MaxLength(MAX_LOGIN_LENGTH)
  @ApiProperty()
  username: string

  @IsNumber()
  @Max(2)
  @Min(0)
  @ApiProperty()
  permissions: number
}
