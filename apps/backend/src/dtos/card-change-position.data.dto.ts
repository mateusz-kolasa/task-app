import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, Min } from 'class-validator'

export default class ChangeCardPositionData {
  @IsNumber()
  @ApiProperty()
  cardId: number

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  newListId?: number

  @IsNumber()
  @Min(1)
  @ApiProperty()
  position: number
}
