import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
  HttpCode,
  Query,
  // UseGuards,
} from '@nestjs/common';
import { ReportService } from '../service/report.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { Report } from '@prisma/client';
import { CreateProductivityDto } from 'src/productivity/dto/productivity-create-dto';
// import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

type CombinedDto = {
  report: CreateReportDto;
  productivity?: Omit<CreateProductivityDto, 'reportId'>;
};

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('/byFieldId/:field_id')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('field_id') field_id: string,
    @Body() combinedDto: CombinedDto,
  ): Promise<Report> {
    try {
      console.log('productivity ', combinedDto.productivity);
      if (combinedDto.productivity) {
        if (!combinedDto.productivity.userId) {
          throw new HttpException(
            'The userId is required to create the productivity.',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      return await this.reportService.create(
        combinedDto.report,
        field_id,
        combinedDto.productivity,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get('/byField/:field_id')
  @HttpCode(HttpStatus.OK)
  async findAll(@Param('field_id') field_id: string): Promise<Report[]> {
    try {
      return await this.reportService.findAll(field_id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
    @Query('onlyNameAndComment') onlyNameAndComment: string = 'false',
  ): Promise<unknown[]> {
    try {
      const withOnlyNameAndComment =
        onlyNameAndComment === 'false' ? false : true;
      return await this.reportService.findOne(+id, withOnlyNameAndComment);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() combinedDto: CombinedDto,
  ): Promise<Report> {
    try {
      return await this.reportService.update(
        +id,
        combinedDto.report,
        combinedDto.productivity,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.reportService.remove(+id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAll(): Promise<void> {
    try {
      await this.reportService.removeAll();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
