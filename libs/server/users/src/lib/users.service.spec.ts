import { Test } from '@nestjs/testing';
import { ServerUsersService } from './users.service';
import { UsersRepository } from './users.repository';

describe('ServerUsersService', () => {
  let service: ServerUsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ServerUsersService,
        { provide: UsersRepository, useValue: {} },
      ],
    }).compile();

    service = module.get(ServerUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
