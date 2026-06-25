import { PartialType } from "@nestjs/swagger";
import { CreateExamSessionDto } from "./create-exam-session.dto";

/** DTO di aggiornamento parziale di una sessione d'esame (tutti i campi opzionali). */
export class UpdateExamSessionDto extends PartialType(CreateExamSessionDto){}
