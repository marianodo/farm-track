import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OWNED_RESOURCE_KEY } from '../decorator/owned-resource.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OwnedResourceGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourceConfig = this.reflector.get<{
      resourceType: string;
      idParam: string;
      byResource?: string;
      idParamByResource?: boolean;
    }>(OWNED_RESOURCE_KEY, context.getHandler());

    if (!resourceConfig) {
      return true; // Si no se aplicó el decorador, permitir acceso
    }

    const { resourceType, idParam, byResource, idParamByResource } =
      resourceConfig;
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false; // No hay usuario autenticado
    }

    // Si el usuario es ADMIN, permitir acceso sin restricciones
    if (user.role === 'ADMIN') {
      return true;
    }

    // Obtener el ID del recurso de la solicitud
    let resourceId: any;
    if (idParamByResource) {
      resourceId = request.params[idParam];
      if (!resourceId) {
        console.log(`No se encontró el ID del recurso en params: ${idParam}`);
        return false;
      }
    } else {
      resourceId = request.body[idParam] || null;
    }

    // Verificar la propiedad según el tipo de recurso
    let isOwner = false;

    try {
      switch (resourceType) {
        case 'field':
          isOwner = await this.verifyFieldOwner(resourceId, user.userId);
          break;
        case 'pen':
          isOwner = await this.verifyPenOwner(
            resourceId,
            user.userId,
            byResource,
          );
          break;
        case 'report':
          isOwner = await this.verifyReportOwner(
            resourceId,
            user.userId,
            byResource,
          );
          break;
        case 'measurement':
          isOwner = await this.verifyMeasurementOwner(
            resourceId,
            user.userId,
            byResource,
          );
          break;
        case 'variable':
          isOwner = await this.verifyVariableOwner(resourceId, user.userId);
          break;
        case 'type_of_object':
          isOwner = await this.verifyTypeOfObjectOwner(resourceId, user.userId);
          break;
        case 'subject':
          isOwner = await this.verifySubjectOwner(
            resourceId,
            user.userId,
            byResource,
          );
          break;
        case 'pen_variable_type':
          isOwner = await this.verifyPenVariableTypeOwner(
            resourceId,
            user.userId,
          );
          break;
        case 'productivity':
          isOwner = await this.verifyProductivityOwner(resourceId, user.userId);
          break;
        default:
          // Si no se reconoce el tipo de recurso, se deniega el acceso
          isOwner = false;
      }
    } catch (error) {
      // Si hay un error al verificar, se deniega el acceso
      console.error(`Error verificando propiedad de ${resourceType}:`, error);
      isOwner = false;
    }

    if (!isOwner) {
      throw new ForbiddenException(
        'You dont have permission to access this resource',
      );
    }

    return true;
  }

  private async verifyFieldOwner(
    fieldId: string,
    userId: string,
  ): Promise<boolean> {
    const field = await this.prisma.field.findUnique({
      where: { id: fieldId },
      select: { userId: true },
    });
    return field?.userId === userId;
  }

  private async verifyPenOwner(
    penId: string,
    userId: string,
    byResource: string,
  ): Promise<boolean> {
    if (byResource && byResource === 'field') {
      const field = await this.prisma.field.findUnique({
        where: { id: penId },
        select: { userId: true },
      });
      return field?.userId === userId;
    }
    const pen = await this.prisma.pen.findUnique({
      where: { id: parseInt(penId) },
      select: { field: { select: { userId: true } } },
    });
    return pen?.field?.userId === userId;
  }

  private async verifyReportOwner(
    reportId: string,
    userId: string,
    byResource: string,
  ): Promise<boolean> {
    if (byResource && byResource === 'field') {
      const field = await this.prisma.field.findUnique({
        where: { id: reportId },
        select: { userId: true },
      });
      return field?.userId === userId;
    }
    const report = await this.prisma.report.findUnique({
      where: { id: parseInt(reportId) },
      select: { field: { select: { userId: true } } },
    });
    return report?.field?.userId === userId;
  }

  private async verifyMeasurementOwner(
    measurementId: string,
    userId: string,
    byResource: string,
  ): Promise<boolean> {
    if (byResource && byResource === 'field') {
      const field = await this.prisma.field.findUnique({
        where: { id: measurementId },
        select: { userId: true },
      });
      return field?.userId === userId;
    }
    if (byResource && byResource === 'report') {
      const report = await this.prisma.report.findUnique({
        where: { id: parseInt(measurementId) },
        select: { field: { select: { userId: true } } },
      });
      return report?.field?.userId === userId;
    }
    if (byResource && byResource === 'subject') {
      const subject = await this.prisma.subject.findUnique({
        where: { id: parseInt(measurementId) },
        select: { field: { select: { userId: true } } },
      });
      return subject?.field?.userId === userId;
    }
    const measurement = await this.prisma.measurement.findUnique({
      where: { id: parseInt(measurementId) },
      select: {
        pen_variable_type_of_object: {
          select: {
            pen: {
              select: {
                field: {
                  select: { userId: true },
                },
              },
            },
          },
        },
      },
    });
    return (
      measurement?.pen_variable_type_of_object?.pen?.field?.userId === userId
    );
  }

  private async verifyVariableOwner(
    variableId: string,
    userId: string,
  ): Promise<boolean> {
    const variable = await this.prisma.variable.findUnique({
      where: { id: parseInt(variableId) },
      select: { userId: true },
    });
    return variable?.userId === userId;
  }

  private async verifyTypeOfObjectOwner(
    typeOfObjectId: string,
    userId: string,
  ): Promise<boolean> {
    const typeOfObject = await this.prisma.typeOfObject.findUnique({
      where: { id: parseInt(typeOfObjectId) },
      select: { userId: true },
    });
    return typeOfObject?.userId === userId;
  }

  private async verifySubjectOwner(
    subjectId: string,
    userId: string,
    byResource: string,
  ): Promise<boolean> {
    if (byResource && byResource === 'field') {
      const field = await this.prisma.field.findUnique({
        where: { id: subjectId },
        select: { userId: true },
      });
      return field?.userId === userId;
    }
    const subject = await this.prisma.subject.findUnique({
      where: { id: parseInt(subjectId) },
      select: { field: { select: { userId: true } } },
    });
    return subject?.field?.userId === userId;
  }

  private async verifyPenVariableTypeOwner(
    penVarTypeId: string,
    userId: string,
  ): Promise<boolean> {
    // Según el schema, el modelo correcto es PenVariableTypeOfObject
    const penVarType = await this.prisma.penVariableTypeOfObject.findUnique({
      where: { id: parseInt(penVarTypeId) },
      select: { pen: { select: { field: { select: { userId: true } } } } },
    });
    return penVarType?.pen?.field?.userId === userId;
  }

  private async verifyProductivityOwner(
    productivityId: string,
    userId: string,
  ): Promise<boolean> {
    // Según el schema, Productivity tiene una relación directa con User y Report
    const productivity = await this.prisma.productivity.findUnique({
      where: { id: parseInt(productivityId) },
      select: {
        userId: true,
        report: {
          select: {
            field: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    // Verificar si pertenece directamente al usuario
    if (productivity?.userId === userId) {
      return true;
    }

    // O verificar a través de la relación report -> field -> userId
    return productivity?.report?.field?.userId === userId;
  }
}
