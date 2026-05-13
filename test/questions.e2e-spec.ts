import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigModule } from '@nestjs/config';

describe('Questions API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
        envFilePath: '.env', 
        isGlobal: true,
      }),
        AppModule], 
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init(); 
  });


  afterAll(async () => {
    await app.close();
  });

  it('/api/questions (GET) - treba da vrati prava pitanja iz baze', () => {
    return request(app.getHttpServer())
      .get('/api/questions')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);

        const prvoPitanje = res.body[0];
        expect(prvoPitanje).toHaveProperty('key');
        expect(prvoPitanje).toHaveProperty('text');
        expect(prvoPitanje).toHaveProperty('category');
        expect(prvoPitanje).toHaveProperty('type');
      });
  });
});


