import { Test } from '@nestjs/testing';
import { ServerUsersController } from './users.controller';
import { ServerUsersService } from './users.service';
import { UsersRepository } from './users.repository';

describe('ServerUsersController', () => {
  let controller: ServerUsersController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ServerUsersService,
        { provide: UsersRepository, useValue: {} },
      ],
      controllers: [ServerUsersController],
    }).compile();

    controller = module.get(ServerUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });
});
