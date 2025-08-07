import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { DatabaseService } from '../service/database.service';
import { Public } from '../../auth/decorator/public.decorator';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Delete('userData/:userId')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserData(@Param('userId') userId: string) {
    try {
      await this.databaseService.deleteUserData(userId);
    } catch (error) {
      throw error;
    }
  }

  // @Delete('tables')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteTables(@Body('tables') schemas: string[]): Promise<void> {
  //   if (!Array.isArray(schemas)) {
  //     throw new Error('Tables must be an array.');
  //   }

  //   await this.databaseService.dropTables(schemas);
  // }
}
