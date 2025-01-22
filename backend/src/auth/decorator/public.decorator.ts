import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic'; // Clave para identificar rutas públicas
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
