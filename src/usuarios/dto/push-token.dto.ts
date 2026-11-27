import { IsIn, IsNotEmpty, IsString, Matches } from 'class-validator';

export class PushTokenDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^ExponentPushToken\[[A-Za-z0-9_-]+\]$/, { message: 'El token debe tener formato Expo válido.' })
  token: string;

  @IsString()
  @IsIn(['android', 'ios'])
  plataforma: 'android' | 'ios';
}

export class DeletePushTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
