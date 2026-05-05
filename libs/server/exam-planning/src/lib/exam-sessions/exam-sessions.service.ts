import { Injectable } from '@nestjs/common';
import { ExamSessionsRepository } from './exam-sessions.repository';

@Injectable()
export class ExamSessionsService {
    constructor(
        private readonly repository: ExamSessionsRepository,
    ) {}

    

}
