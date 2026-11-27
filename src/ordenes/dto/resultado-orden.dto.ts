import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ResultadoOrdenDto {
  @IsIn(['ejecutada', 'fallida'])
  estado: 'ejecutada' | 'fallida';

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  duracion_s?: number;

  @IsOptional()
  @IsString()
  mensaje?: string;
}
