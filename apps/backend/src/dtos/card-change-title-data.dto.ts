import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator'
import { MAX_CARD_TITLE_LENGTH } from 'shared-consts'

export default class ChangeCardTitleData {
  @IsNumber()
  @ApiProperty()
  cardId: number

  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CARD_TITLE_LENGTH)
  @ApiProperty()
  title: string
}
