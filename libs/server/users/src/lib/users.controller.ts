import { Body, Controller, Delete, Get, Param, Patch, Post, Query, ParseIntPipe, ParseEnumPipe, ValidationPipe, UseGuards } from '@nestjs/common';
import { ServerUsersService } from './users.service';
import { ApiTags, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard, UserRole } from '@server/security';

@ApiTags('Users APIs')
@Controller('users')
export class ServerUsersController {
  constructor(private serverUsersService: ServerUsersService) {}

    @Get() // GET /users or /users?role=value
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    @ApiQuery({ name: 'role', required: false, enum: UserRole })
    getUsers(@Query('role', new ParseEnumPipe(UserRole, {optional: true})) role?: UserRole) {
        return this.serverUsersService.getUsers(role);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    getMe(@CurrentUser() user:unknown) {
        return user;
    }

    @Get(':id') // GET /users/:id
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA,UserRole.DOCENTE)
    @ApiBearerAuth()
    getOneUser(@Param('id', ParseIntPipe) id: number) {
        return this.serverUsersService.getOneUser(id);
    }

    @Post() // POST /users
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Devis' },
                email: { type: 'string', example: 'bianchin@unibs.it' },
                password: {type: 'string', example: 'Password1!'},
                role: { type: 'string', enum: Object.values(UserRole), example: UserRole.DOCENTE}
            },
            required: ['name', 'email', 'password', 'role'],
        },
    })
    create(@Body(ValidationPipe) user: CreateUserDto) {
        return this.serverUsersService.create(user);
    }

    @Patch(':id') // PATCH /users/:id
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            // UpdateUserDto e' PartialType(OmitType(CreateUserDto, ['password'])):
            // tutti i campi sono opzionali, quindi nessun 'required'.
            properties: {
                name: { type: 'string', example: 'Devis' },
                email: { type: 'string', example: 'bianchin@unibs.it' },
                role: { type: 'string', enum: Object.values(UserRole), example: UserRole.DOCENTE}
            },
        },
    })
    update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) userUpdate: UpdateUserDto) {
        //return {id, ...userUpdate};
        return this.serverUsersService.update(id,userUpdate);
    }

    @Delete(':id') // DELETE /users/:id
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    removeUser(@Param('id', ParseIntPipe) id: number) {
        return this.serverUsersService.removeUser(id);    
    }
}
