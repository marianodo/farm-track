import { Injectable } from '@nestjs/common';
import { ReportRepository } from '../repository/report.repository';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { Report } from '@prisma/client';
import { CreateProductivityDto } from 'src/productivity/dto/productivity-create-dto';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async create(
    report: CreateReportDto,
    field_id: string,
    productivity: Omit<CreateProductivityDto, 'reportId'>,
  ): Promise<Report> {
    try {
      return await this.reportRepository.create(report, field_id, productivity);
    } catch (error) {
      throw error;
    }
  }
  async findAll(field_id: string): Promise<Report[]> {
    try {
      return await this.reportRepository.findAll(field_id);
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number, onlyNameAndComment: boolean): Promise<unknown[]> {
    try {
      return await this.reportRepository.findOne(id, onlyNameAndComment);
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: number,
    report: UpdateReportDto,
    productivity: CreateProductivityDto,
  ): Promise<Report> {
    try {
      return await this.reportRepository.update(id, report, productivity);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<Report> {
    try {
      return await this.reportRepository.remove(id);
    } catch (error) {
      throw error;
    }
  }

  async removeAll(): Promise<void> {
    try {
      return await this.reportRepository.removeAll();
    } catch (error) {
      throw error;
    }
  }
}
