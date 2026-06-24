import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { ServerUsersService } from './users.service';
import { UsersRepository } from './users.repository';

describe('ServerUsersService', () => {
  let service: ServerUsersService;
  let repository: {
    findByEmail: jest.Mock;
    updateOne: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findByEmail: jest.fn(),
      updateOne: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        ServerUsersService,
        { provide: UsersRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(ServerUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });

  describe('update', () => {
    it('hasha la nuova password e la passa al repository (mai in chiaro)', async () => {
      repository.updateOne.mockResolvedValue({ id: 1 });

      await service.update(1, { name: 'Nuovo Nome', password: 'NuovaPass1!' });

      expect(repository.updateOne).toHaveBeenCalledTimes(1);
      const [id, dto, passwordHash] = repository.updateOne.mock.calls[0];
      expect(id).toBe(1);
      expect(dto.name).toBe('Nuovo Nome');
      // L'hash è presente, è diverso dalla password in chiaro e verifica con bcrypt.
      expect(passwordHash).toBeDefined();
      expect(passwordHash).not.toBe('NuovaPass1!');
      expect(await bcrypt.compare('NuovaPass1!', passwordHash)).toBe(true);
    });

    it('non passa alcun passwordHash se la password non viene fornita', async () => {
      repository.updateOne.mockResolvedValue({ id: 1 });

      await service.update(1, { name: 'Solo Nome' });

      const [, , passwordHash] = repository.updateOne.mock.calls[0];
      expect(passwordHash).toBeUndefined();
    });
  });
});
