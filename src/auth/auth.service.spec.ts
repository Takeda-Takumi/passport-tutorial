import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      // providers: [AuthService],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be return null if username is not found', () => {
    return expect(service.validateUser('foo', 'bar')).resolves.toBeNull();
  });

  it("should be return null if pass don't match ", () => {
    return expect(service.validateUser('john', 'bar')).resolves.toBeNull();
  });

  it('should be return not null if username and pass matched', async () => {
    const result = await service.validateUser('john', 'changeme');
    expect(result).not.toBeNull();
  });

  it('should not have property password if username and pass matched', async () => {
    const result = await service.validateUser('john', 'changeme');
    expect(result).not.toHaveProperty('password');
  });

  it('should return access_token if login', async () => {
    const user = {
      username: 'john',
      userId: 1,
    };
    const payload = {
      username: user.username,
      sub: user.userId,
    };
    const result = await service.login(user);
    expect(result).toHaveProperty('access_token', jwtService.sign(payload));
  });
});
