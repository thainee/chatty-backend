import { JoiRequestValidationError } from '@globals/helpers/error-handler';
import { Request } from 'express';
import { ObjectSchema } from 'joi';

type IJoiDecorator = (
  target: any,
  key: string,
  descriptor: PropertyDescriptor
) => void;

export function joiValidation(schema: ObjectSchema): IJoiDecorator {
  return (_target, _key, descriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [req] = args as [Request];
      const { error } = schema.validate(req.body);
      if (error?.details) {
        throw new JoiRequestValidationError(error.details[0].message);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
