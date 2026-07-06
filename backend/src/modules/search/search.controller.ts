import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  async search(@Query('q') q: string, @Query('types') types?: string) {
    const entityTypes = types ? types.split(',').map(t => t.trim()).filter(Boolean) : undefined;
    return this.searchService.search(q, entityTypes);
  }
}
