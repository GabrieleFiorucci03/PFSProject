import { Test } from '@nestjs/testing';
import { ServerUsersService } from './users.service';

describe('ServerUsersService', () => {
  let service: ServerUsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ServerUsersService],
    }).compile();

    service = module.get(ServerUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
