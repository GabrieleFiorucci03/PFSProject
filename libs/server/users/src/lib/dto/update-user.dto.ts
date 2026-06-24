import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";

/**
 * Dati per l'aggiornamento di un utente: tutti i campi di `CreateUserDto` ma
 * opzionali (`PartialType`) e SENZA `password` (`OmitType`). La password si
 * cambia per altra via (profili docente/segretario), così non viaggia qui in chiaro.
 */
export class UpdateUserDto extends PartialType(
    OmitType(CreateUserDto, ['password'] as const),
) {}
