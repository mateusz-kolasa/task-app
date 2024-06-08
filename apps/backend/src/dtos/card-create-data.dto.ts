import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString, MaxLength } from 'class-validator'
import { MAX_CARD_TITLE_LENGTH } from 'src/consts/card.consts'

export default class CardCreateData {
  @IsString()
  @MaxLength(MAX_CARD_TITLE_LENGTH)
  @ApiProperty()
  title: string

  @IsNumber()
  @ApiProperty()
  listId: number
}
