import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const DispositivoActual = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest().dispositivo,
);
