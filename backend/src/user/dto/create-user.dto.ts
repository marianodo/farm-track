// export class CreateUserDto {}

import { User } from "@prisma/client";

export type CreateUserDto = Omit<User, 'id' | 'created_at' | 'updated_at' | 'verification_token' | 'is_verified' | 'role'>