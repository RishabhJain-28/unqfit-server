import { registerDecorator, ValidationOptions } from 'class-validator';

// checks not blank after trim
export function IsNotBlank(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsNotBlank',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: propertyName + ' field cannot be blank',
        ...validationOptions,
      },

      validator: {
        validate(value: any) {
          return typeof value === 'string' && value.trim().length > 0;
        },
      },
    });
  };
}
