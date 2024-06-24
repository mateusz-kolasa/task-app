import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator'
import { MAX_LIST_TITLE_LENGTH } from 'src/consts/list.const'

export default class ChangeListTitleData {
  @IsNumber()
  @ApiProperty()
  listId: number

  @IsString()
  @MinLength(1)
  @MaxLength(MAX_LIST_TITLE_LENGTH)
  @ApiProperty()
  title: string
}
