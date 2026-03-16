import { Test, TestingModule } from '@nestjs/testing';
import { PacientesResolver } from './pacientes.resolver';
import { PacientesService } from './pacientes.service';

describe('PacientesResolver', () => {
  let resolver: PacientesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PacientesResolver, PacientesService],
    }).compile();

    resolver = module.get<PacientesResolver>(PacientesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
