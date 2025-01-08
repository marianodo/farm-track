import { Injectable } from '@nestjs/common';
import { DatabaseRepository } from '../repository/database.repository';

@Injectable()
export class DatabaseService {
  constructor(private readonly databaseRepository: DatabaseRepository) {}

  async dropTables(schemas: string[]): Promise<void> {
    if (!schemas || schemas.length === 0) {
      throw new Error('No schemas provided to delete.');
    }

    // Puedes agregar validaciones adicionales aquí si es necesario
    await this.databaseRepository.dropTables(schemas);
  }

  async deleteUserData(userId: string) {
    try {
      await this.databaseRepository.deleteUserData(userId);
    } catch (error) {
      throw error;
    }
  }
}
