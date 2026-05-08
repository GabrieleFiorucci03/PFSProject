import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ExamSessionsService } from './exam-sessions.service';
import { JwtAuthGuard, Roles, RolesGuard, UserRole } from '@server/security';
import { CreateExamSessionDto } from './dto/create-exam-session.dto';
import { UpdateExamSessionDto } from './dto/update-exam-session.dto';

@ApiTags('Exam Sessions APIs')
@Controller('exam-sessions')
export class ExamSessionsController {

    constructor(private readonly service: ExamSessionsService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    findAll() {
        return this.service.findAll();
    }

    @Get(':examSessionId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    findById(@Param('examSessionId', ParseIntPipe) examSessionId: number) {
        return this.service.findById(examSessionId);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    create(@Body() dto: CreateExamSessionDto) {
        return this.service.createOne(dto);
    }

    @Patch(':examSessionId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    update(
        @Param('examSessionId', ParseIntPipe) examSessionId: number,
        @Body() dto: UpdateExamSessionDto,
    ) {
        return this.service.updateOne(examSessionId, dto);
    }

    @Delete(':examSessionId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(@Param('examSessionId', ParseIntPipe) examSessionId: number) {
        return this.service.deleteOne(examSessionId);
    }

}
