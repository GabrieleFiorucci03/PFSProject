import { PartialType } from '@nestjs/swagger';
import { CreateSecretariatDto } from './create-secretariat.dto';

export class UpdateSecretariatDto extends PartialType(CreateSecretariatDto) {}
