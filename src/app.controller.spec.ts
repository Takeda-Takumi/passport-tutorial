import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtStrategy } from './auth/jwt.strategy';

describe('AppController', () => {
  let appController: AppController;
  let app: INestApplication;
  let jwtStrategy: JwtStrategy;
  let jwtAuthGuard: JwtAuthGuard;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [AppController],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn((context) => {
          return true;
        }),
      })
      .overrideProvider(JwtStrategy)
      .useValue({
        validate: jest.fn((payload) => payload),
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    appController = app.get<AppController>(AppController);
    jwtStrategy = app.get<JwtStrategy>(JwtStrategy);
    jwtAuthGuard = app.get<JwtAuthGuard>(JwtAuthGuard);
  });

  describe('/ ', () => {
    describe('/auth/login #POST', () => {
      it('should return status UNAUTHORIZED if user is not found', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .set('Content-Type', 'application/json')
          .send({
            username: 'foo',
            password: 'bar',
          });

        expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      });

      it('should return status UNAUTHORIZED if username is found but wrong password sent', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .set('Content-Type', 'application/json')
          .send({
            username: 'john',
            password: 'miss',
          });

        expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      });

      it('should return status CREATED if username and password is found', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            username: 'john',
            password: 'changeme',
          })
          .set('Content-Type', 'application/json')
          .expect(HttpStatus.CREATED);
      });

      it('should return access_token if login sccessed', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            username: 'john',
            password: 'changeme',
          })
          .set('Content-Type', 'application/json');
        expect(response.body.access_token).toBeDefined();
      });
    });

    describe('/profile ', () => {
      // it('should return user data if jwt authorization successed', async () => {
      //   const response = await request(app.getHttpServer())
      //     .get('/profile')
      //     .set(
      //       'Authorization',
      //       'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG4iLCJzdWIiOjEsImlhdCI6MTY5MDYxNTQyMiwiZXhwIjoxNjkwNjE1NDgyfQ.PnHpMMnXlBOCQOZiCVfaQNnIzjZbyHCts2fxDu-JBF',
      //     );
      //   expect(response.body.userId).toBeDefined();
      //   expect(response.body.username).toBeDefined();
      // });

      it('should return user data if jwt authorization successed', async () => {
        const response = await request(app.getHttpServer())
          .get('/profile')
          .set(
            'Authorization',
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG4iLCJzdWIiOjEsImlhdCI6MTY5MDYxNTQyMiwiZXhwIjoxNjkwNjE1NDgyfQ.PnHpMMnXlBOCQOZiCVfaQNnIzjZbyHCts2fxDu-JBF',
          );
        console.log('this is console log', response.body);
        console.log(response.statusCode);
        expect(jwtAuthGuard.canActivate).toHaveBeenNthCalledWith(1);
        expect(jwtStrategy.validate).toHaveBeenNthCalledWith(1);
        expect(response.body.userId).toBeDefined();
        expect(response.body.username).toBeDefined();
      });
    });
  });
});
