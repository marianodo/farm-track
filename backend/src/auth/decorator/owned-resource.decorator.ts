import { SetMetadata } from '@nestjs/common';

export const OWNED_RESOURCE_KEY = 'ownedResourceKey';

/**
 * Decorador para marcar rutas donde se debe verificar que el recurso
 * pertenece al usuario autenticado
 * @param resourceType Tipo de recurso (ej: 'field', 'pen')
 * @param idParam Nombre del paru00e1metro que contiene el ID del recurso
 */
export const OwnedResource = (
  resourceType: string,
  idParam: string = 'id',
  byResource: string | null = null,
  idParamByResource: boolean = true,
) =>
  SetMetadata(OWNED_RESOURCE_KEY, {
    resourceType,
    idParam,
    byResource,
    idParamByResource,
  });
