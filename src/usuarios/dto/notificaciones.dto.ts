import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificacionesDto {
  @IsOptional() @IsBoolean() push?: boolean;
  @IsOptional() @IsBoolean() intrusos?: boolean;
  @IsOptional() @IsBoolean() denegados?: boolean;
}
