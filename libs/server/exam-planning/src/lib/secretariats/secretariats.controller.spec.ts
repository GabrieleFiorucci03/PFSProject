import { Test, TestingModule } from '@nestjs/testing';
import { SecretariatsController } from './secretariats.controller';

describe('SecretariatsController', () => {
  let controller: SecretariatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecretariatsController],
    }).compile();

    controller = module.get<SecretariatsController>(SecretariatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
