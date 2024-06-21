import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Min } from 'class-validator'

export default class ChangeCardPositionData {
  @IsNumber()
  @ApiProperty()
  cardId: number

  @IsNumber()
  @ApiProperty()
  newListId?: number

  @IsNumber()
  @Min(1)
  @ApiProperty()
  position: number
}
