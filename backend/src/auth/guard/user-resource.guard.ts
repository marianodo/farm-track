import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_RESOURCE_KEY } from '../decorator/user-resource.decorator';

@Injectable()
export class UserResourceGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const resourceConfig = this.reflector.get<{ userIdParam: string }>(
      USER_RESOURCE_KEY,
      context.getHandler(),
    );

    if (!resourceConfig) {
      return true; //? Si no se aplicó el decorador, permitir acceso
    }

    const { userIdParam } = resourceConfig;
    const request = context.switchToHttp().getRequest();
    const user = request.user; //* El usuario autenticado (del JwtStrategy)

    if (!user) {
      return false; //! No hay usuario autenticado
    }

    //? Si el usuario es ADMIN, permitir acceso sin restricciones
    if (user.role === 'ADMIN') {
      return true;
    }

    //? Variable para ID de usuario en la solicitud (params, body o query)
    let resourceUserId: string | number;

    //? Comprobar en route params (URL)
    if (request.params && request.params[userIdParam] !== undefined) {
      resourceUserId = request.params[userIdParam];
    }
    //? Comprobar en body
    else if (request.body && request.body[userIdParam] !== undefined) {
      resourceUserId = request.body[userIdParam];
    }
    //? Comprobar en query params
    else if (request.query && request.query[userIdParam] !== undefined) {
      resourceUserId = request.query[userIdParam];
    }

    //? Si el ID del recurso es undefined, permitir acceso
    //* (util para endpoints como "crear" donde no hay ID)
    if (resourceUserId === undefined) {
      return true;
    }

    //? Convertir IDs a string para la comparcion y que no falle
    const userIdString = user.userId?.toString();
    const resourceUserIdString = resourceUserId?.toString();

    //? Verificar si el recurso pertenece al usuario autenticado
    if (userIdString !== resourceUserIdString) {
      throw new ForbiddenException(
        'You dont have permission to access this resource',
      );
    }

    return true;
  }
}
