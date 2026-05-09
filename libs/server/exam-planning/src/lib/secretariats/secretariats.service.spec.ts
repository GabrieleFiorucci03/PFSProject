import { Test, TestingModule } from '@nestjs/testing';
import { ServerUsersService } from '@server/users';
import { SecretariatsService } from './secretariats.service';
import { SecretariatsRepository } from './secretariats.repository';

describe('SecretariatsService', () => {
  let service: SecretariatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecretariatsService,
        { provide: SecretariatsRepository, useValue: {} },
        { provide: ServerUsersService, useValue: {} },
      ],
    }).compile();

    service = module.get<SecretariatsService>(SecretariatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
