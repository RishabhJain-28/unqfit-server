import { Transform } from 'class-transformer';
import { IsNotBlank } from './IsNotBlank.decorator';
import { ValidatorComposer } from './validatorComposer';
import { MaxLength } from 'class-validator';

export function IsValidString(options?: { maxStringLength: number }) {
  let validationPipe = [IsNotBlank()];
  if (options?.maxStringLength) {
    validationPipe.push(MaxLength(options.maxStringLength));
  }
  validationPipe.push(Transform(({ value }) => value && value.trim()));
  return ValidatorComposer(validationPipe.reverse(), 'isValidString')();
}
