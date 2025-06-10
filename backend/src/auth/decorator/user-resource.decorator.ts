import { SetMetadata } from '@nestjs/common';

export const USER_RESOURCE_KEY = 'userResourceKey';
export const USER_ID_PARAM = 'userIdParam';

/**
 * Decorador para marcar las rutas donde se debe verificar que el recurso pertenece al usuario autenticado
 * @param userIdParam El nombre del parámetro en la ruta o body que contiene el ID del usuario a verificar
 */

export const UserResource = (userIdParam: string) =>
  SetMetadata(USER_RESOURCE_KEY, { userIdParam });
