import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ListService } from './list.service'
import ListCreateData from 'src/dtos/list-create-data.dto'
import { ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { ListFullData } from 'shared-types'

@ApiTags('list')
@Controller('list')
@UseGuards(JwtAuthGuard)
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post()
  create(@Body() createListDto: ListCreateData): Promise<ListFullData> {
    return this.listService.create(createListDto)
  }
}
