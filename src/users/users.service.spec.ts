import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './user.entity';
import 'jest-to-equal-type';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be return undefined if username not found', () => {
    return expect(service.findOne('foo')).resolves.toBeUndefined();
  });

  it('should be return User if username matched "foo"', async () => {
    const result = await service.findOne('john');
    expect(result).toEqualType<User>;
  });
});
