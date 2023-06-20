import { IsDefined, IsNotEmpty, IsOptional } from 'class-validator';
import { IsNotBlank as IsNotBlankString } from './IsNotBlank.decorator';

export function ValidatorComposer(
  validators: PropertyDecorator[],
  name: string,
): () => PropertyDecorator {
  return function () {
    return function (target: any, propertyKey: string): void {
      validators.forEach((validator) => validator(target, propertyKey));
    };
  };
}
