import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Min } from 'class-validator'

export default class ChangeListPositionData {
  @IsNumber()
  @ApiProperty()
  listId: number

  @IsNumber()
  @Min(1)
  @ApiProperty()
  position: number
}
