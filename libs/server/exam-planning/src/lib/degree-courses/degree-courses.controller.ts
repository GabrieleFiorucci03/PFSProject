import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DegreeCoursesService } from './degree-courses.service';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard, UserRole } from '@server/security';
import type { AuthenticatedUser } from '@server/auth';
import { CreateDegreeCourseDto } from './dto/create-degree-course.dto';
import { UpdateDegreeCourseDto } from './dto/update-degree-course.dto';

@ApiTags('Degree Courses APIs')
@Controller('degree-courses')
export class DegreeCoursesController {
    constructor(private readonly service: DegreeCoursesService) {}

    // Lista completa: solo SEGRETERIA. Il DOCENTE usa GET /mine (i suoi corsi).
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    findAll() {
        return this.service.findAll();
    }

    // NB: 'mine' deve stare PRIMA di ':degreeCourseId', altrimenti verrebbe
    // interpretato come id e ParseIntPipe fallirebbe.
    @Get('mine')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DOCENTE)
    @ApiBearerAuth()
    findOwn(@CurrentUser() currentUser: AuthenticatedUser) {
        return this.service.findOwnDegreeCourses(currentUser);
    }

    @Get(':degreeCourseId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    findById(@Param('degreeCourseId', ParseIntPipe) degreeCourseId: number) {
        return this.service.findById(degreeCourseId);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    create(@Body() dto: CreateDegreeCourseDto) {
        return this.service.createOne(dto);
    }

    @Patch(':degreeCourseId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    update(
        @Param('degreeCourseId', ParseIntPipe) degreeCourseId: number,
        @Body() dto: UpdateDegreeCourseDto,
    ) {
        return this.service.updateOne(degreeCourseId, dto);
    }

    @Delete(':degreeCourseId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(@Param('degreeCourseId', ParseIntPipe) degreeCourseId: number) {
        return this.service.deleteOne(degreeCourseId);
    }

}
