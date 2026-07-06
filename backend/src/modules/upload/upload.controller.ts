import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.upload(file);
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  @HttpCode(HttpStatus.CREATED)
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploadMultiple(files);
  }

  @Delete(':key')
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Param('key') key: string) {
    return this.uploadService.delete(key);
  }
}
