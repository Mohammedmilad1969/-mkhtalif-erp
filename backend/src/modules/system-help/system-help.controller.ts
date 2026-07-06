import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SystemHelpService } from './system-help.service';

@Controller('system-help')
@UseGuards(JwtAuthGuard)
export class SystemHelpController {
  constructor(private readonly systemHelpService: SystemHelpService) {}

  @Get('search')
  search(@Query('q') q?: string) {
    return this.systemHelpService.search(q || '');
  }

  @Get('articles/:id')
  getArticle(@Param('id') id: string) {
    return this.systemHelpService.getArticle(id);
  }

  @Get('categories')
  getCategories() {
    return this.systemHelpService.getAllCategories();
  }

  @Get()
  getAll() {
    return this.systemHelpService.getAll();
  }
}
