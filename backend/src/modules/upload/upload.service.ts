import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from '../../config/s3.service';

@Injectable()
export class UploadService {
  constructor(private s3Service: S3Service) {}

  async upload(file: Express.Multer.File, folder: string = 'uploads') {
    const extension = file.originalname.split('.').pop();
    const key = `${folder}/${uuidv4()}.${extension}`;
    const fileKey = await this.s3Service.uploadFile(file, key);
    return { key: fileKey, url: key, originalName: file.originalname, size: file.size, mimetype: file.mimetype };
  }

  async uploadMultiple(files: Express.Multer.File[], folder: string = 'uploads') {
    return Promise.all(files.map((file) => this.upload(file, folder)));
  }

  async delete(key: string) {
    await this.s3Service.deleteFile(key);
    return { message: 'File deleted successfully' };
  }
}
