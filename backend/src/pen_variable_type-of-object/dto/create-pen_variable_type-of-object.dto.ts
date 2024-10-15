import { JsonValue } from '@prisma/client/runtime/library';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  registerDecorator,
  ValidateNested,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

function IsObjectOrArray(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isObjectOrArray',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return (
            typeof value === 'object' &&
            (Array.isArray(value) || value !== null)
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be an object or an array`;
        },
      },
    });
  };
}

class CustomParameters {
  @IsNotEmpty()
  @IsObjectOrArray({ message: 'value must be an object or an array' })
  value: object | [];
}

export class CreatePenVariableTypeOfObjectDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CustomParameters)
  custom_parameters: JsonValue;

  @IsNotEmpty()
  penId: number;

  @IsNotEmpty()
  variableId: number;

  @IsNotEmpty()
  typeOfObjectId: number;
}
