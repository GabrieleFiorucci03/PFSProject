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
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard, UserRole } from '@server/security';
import type { AuthenticatedUser } from '@server/auth';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@ApiTags('Subjects APIs')
@Controller('subjects')
export class SubjectsController {
    constructor(private readonly service: SubjectsService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'degreeCourseId', required: false, type: Number })
    @ApiQuery({ name: 'teacherId', required: false, type: Number })
    findAll(
        @Query('degreeCourseId', new ParseIntPipe({ optional: true })) degreeCourseId?: number,
        @Query('teacherId', new ParseIntPipe({ optional: true })) teacherId?: number,
    ) {
        return this.service.findAll({ degreeCourseId, teacherId });
    }

    @Get('mine')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DOCENTE)
    @ApiBearerAuth()
    findOwn(@CurrentUser() currentUser: AuthenticatedUser) {
        return this.service.findOwnSubjects(currentUser);
    }

    @Get(':subjectId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    findById(@Param('subjectId', ParseIntPipe) subjectId: number) {
        return this.service.findById(subjectId);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    create(@Body() dto: CreateSubjectDto) {
        return this.service.createOne(dto);
    }

    @Patch(':subjectId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    update(
        @Param('subjectId', ParseIntPipe) subjectId: number,
        @Body() dto: UpdateSubjectDto,
    ) {
        return this.service.updateOne(subjectId, dto);
    }

    @Delete(':subjectId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(@Param('subjectId', ParseIntPipe) subjectId: number) {
        return this.service.deleteOne(subjectId);
    }
}
