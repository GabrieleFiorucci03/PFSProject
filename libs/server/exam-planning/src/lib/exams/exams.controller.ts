import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard, UserRole } from '@server/security';
import type { AuthenticatedUser } from '@server/auth';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@ApiTags('Exams APIs')
@Controller('exams')
export class ExamsController {
    constructor(private readonly service: ExamsService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    findAll() {
        return this.service.findAll();
    }

    @Get('mine')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DOCENTE)
    @ApiBearerAuth()
    findOwn(@CurrentUser() currentUser: AuthenticatedUser) {
        return this.service.findOwnExams(currentUser);
    }

    @Get('by-teacher/:teacherId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    findByTeacher(@Param('teacherId', ParseIntPipe) teacherId: number) {
        return this.service.findByTeacher(teacherId);
    }

    @Get(':examId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    findById(@Param('examId', ParseIntPipe) examId: number) {
        return this.service.findById(examId);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DOCENTE)
    @ApiBearerAuth()
    create(
        @Body() dto: CreateExamDto,
        @CurrentUser() currentUser: AuthenticatedUser,
    ) {
        return this.service.createOne(dto, currentUser);
    }

    @Patch(':examId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA, UserRole.DOCENTE)
    @ApiBearerAuth()
    update(
        @Param('examId', ParseIntPipe) examId: number,
        @Body() dto: UpdateExamDto,
        @CurrentUser() currentUser: AuthenticatedUser,
    ) {
        return this.service.updateOne(examId, dto, currentUser);
    }

    @Delete(':examId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA, UserRole.DOCENTE)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(
        @Param('examId', ParseIntPipe) examId: number,
        @CurrentUser() currentUser: AuthenticatedUser,
    ) {
        return this.service.deleteOne(examId, currentUser);
    }
}
