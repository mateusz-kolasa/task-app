import { Controller, Post, Body } from '@nestjs/common'
import { ListService } from './list.service'
import ListCreateData from 'src/dtos/list-create-data.dto'

@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post()
  create(@Body() createListDto: ListCreateData) {
    return this.listService.create(createListDto)
  }
}
