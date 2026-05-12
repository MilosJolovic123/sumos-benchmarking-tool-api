import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AppModule } from './../src/app.module';
import {
  Submission,
  SubmissionDocument,
} from './../src/schemas/submission.schema';
import { ConfigModule } from '@nestjs/config';

describe('Submissions API (e2e)', () => {
  let app: INestApplication;
  let submissionModel: Model<SubmissionDocument>;
  let createdSubmissionId: string;
  let dbConnection: Connection;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    submissionModel = moduleFixture.get<Model<SubmissionDocument>>(
      getModelToken(Submission.name),
    );

    dbConnection = moduleFixture.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    if (createdSubmissionId) {
      await submissionModel.findByIdAndDelete(createdSubmissionId);
    }
    await app.close();
    await dbConnection.close();
  });

  it('/api/submissions (POST) - treba uspešno da sačuva i mapira CEO payload', async () => {
    // 1. Priprema testnog payload-a
    const testPayload = {
      email: 'student@test.com',
      hasMobilityExperience: true,
      odgovori: {
        // Demografija i Studije
        demo_gender: 'Male',
        demo_age: 23,
        study_status_university:
          'University of Belgrade, Faculty of Organizational Sciences',
        study_status_study_area:
          'Information and Communication Technologies (ICTs)',
        study_status_study_level: 'Master',
        study_status_origin_area:
          'A mid-sized city (ca 40.000-100.000 inhabitants)',
        study_status_study_location: '30-200 km away from my hometown',
        study_status_study_living_location: 'Student dormitory',
        exchange_status: 'Yes, once',

        // Svest (Awareness)
        awareness_1: 4,
        awareness_2: 5,
        awareness_3: 4,
        awareness_4: 3,
        awareness_5: 2,

        // Stavovi (Attitudes/Motivations)
        attitude_1: 4,
        attitude_2: 5,
        attitude_3: 5,
        attitude_4: 4,

        // Navike - Putovanja
        habits_travel_daily: {
          'Public transport': 5,
          Walk: 4,
          'Car (alone)': 1,
        },
        habits_travel_distance: '5-10km',
        habits_other_plane: { Plane: 4 },
        habits_trips_total: '1-2',
        habits_trips_plane: '1',

        // Navike - Život
        habits_living_heating: 'Included in rent/dorm',
        habits_living_laundry: '2-3',
        habits_sustainability: {
          'I take short showers (<10 min)': 5,
          'I recycle / separate waste': 3,
        },

        // Navike - Ishrana i kupovina
        habits_consumption_diet: 'Vegetarian',
        habits_consumption_meat_days: '1-2',
        habits_consumption_restaurants: 4,
        habits_consumption_leftovers: 5,
        habits_consumption_markets: 3,
        habits_consumption_seasonal: 4,
        habits_consumption_bags: 5,
        habits_consumption_bottle: 5,
        habits_consumption_secondhand: 2,
        habits_consumption_new_clothes: '3-5',

        // Navike - Digital
        habits_digital_devices: 4,
        habits_digital_energy_saving: 5,
        habits_digital_files: 3,
        habits_digital_tradein: 1,
        habits_digital_ewaste: 4,

        // Zajednica
        habits_community_activities: 2,

        // Prepreke
        barriers_structural_products: 4,
        barriers_structural_mobility: 2,
        barriers_financial_expensive: 5,
        barriers_informational_confusing: 3,
        barriers_informational_uninformed: 4,
        barriers_personal_convenience: 2,
        barriers_personal_support: 3,
        barriers_personal_habits: 4,

        // Rubrike (Mobility)
        mobility_before_rubric: {
          Awareness: 3,
          'Attitude / Motivation': 4,
          Habits: 2,
          'Barriers / Coping': 3,
        },
        mobility_during_rubric: {
          Awareness: 4,
          'Attitude / Motivation': 5,
          Habits: 4,
          'Barriers / Coping': 4,
        },
        mobility_after_rubric: {
          Awareness: 5,
          'Attitude / Motivation': 5,
          Habits: 4,
          'Barriers / Coping': 4,
        },
      },
    };

    // 2. Slanje zahteva
    const response = await request(app.getHttpServer())
      .post('/api/submissions')
      .send(testPayload)
      .expect(201);

    createdSubmissionId = response.body.submissionId;

    // 3. Učitavanje dokumenta iz baze
    const savedDoc = await submissionModel.findById(createdSubmissionId);
    expect(savedDoc).toBeDefined();

    // 4. Pomoćna funkcija za testiranje svakog odgovora (koristimo toEqual jer radi duboko poređenje objekata i nizova)
    const checkAnswer = (key: string, expectedValue: any) => {
      const answer = savedDoc!.answers.find((a) => a.questionKey === key);

      // Ako baci grešku, terminal će ti tačno reći na kom ključu je puklo
      expect(answer).toBeDefined();
      expect(answer!.value).toEqual(expectedValue);
      expect(answer!.questionText).toBeDefined();
    };

    // ----------------------------------------------------------------------
    // 5. DETALJNA E2E PROVERA SVIH PITANJA SORTIRANIH PO MODELU
    // ----------------------------------------------------------------------

    // Demografija i Studije
    checkAnswer('demo_gender', 'Male');
    checkAnswer('demo_age', 23);
    checkAnswer(
      'study_status_university',
      'University of Belgrade, Faculty of Organizational Sciences',
    );
    checkAnswer(
      'study_status_study_area',
      'Information and Communication Technologies (ICTs)',
    );
    checkAnswer('study_status_study_level', 'Master');
    checkAnswer(
      'study_status_origin_area',
      'A mid-sized city (ca 40.000-100.000 inhabitants)',
    );
    checkAnswer(
      'study_status_study_location',
      '30-200 km away from my hometown',
    );
    checkAnswer('study_status_study_living_location', 'Student dormitory');
    checkAnswer('exchange_status', 'Yes, once');

    // Svest (Awareness)
    checkAnswer('awareness_1', 4);
    checkAnswer('awareness_2', 5);
    checkAnswer('awareness_3', 4);
    checkAnswer('awareness_4', 3);
    checkAnswer('awareness_5', 2);

    // Stavovi (Attitudes/Motivations)
    checkAnswer('attitude_1', 4);
    checkAnswer('attitude_2', 5);
    checkAnswer('attitude_3', 5);
    checkAnswer('attitude_4', 4);

    // Navike - Putovanja
    checkAnswer('habits_travel_daily', {
      'Public transport': 5,
      Walk: 4,
      'Car (alone)': 1,
    });
    checkAnswer('habits_travel_distance', '5-10km');
    checkAnswer('habits_other_plane', { Plane: 4 });
    checkAnswer('habits_trips_total', '1-2');
    checkAnswer('habits_trips_plane', '1');

    // Navike - Život
    checkAnswer('habits_living_heating', 'Included in rent/dorm');
    checkAnswer('habits_living_laundry', '2-3');
    checkAnswer('habits_sustainability', {
      'I take short showers (<10 min)': 5,
      'I recycle / separate waste': 3,
    });

    // Navike - Ishrana i kupovina
    checkAnswer('habits_consumption_diet', 'Vegetarian');
    checkAnswer('habits_consumption_meat_days', '1-2');
    checkAnswer('habits_consumption_restaurants', 4);
    checkAnswer('habits_consumption_leftovers', 5);
    checkAnswer('habits_consumption_markets', 3);
    checkAnswer('habits_consumption_seasonal', 4);
    checkAnswer('habits_consumption_bags', 5);
    checkAnswer('habits_consumption_bottle', 5);
    checkAnswer('habits_consumption_secondhand', 2);
    checkAnswer('habits_consumption_new_clothes', '3-5');

    // Navike - Digital
    checkAnswer('habits_digital_devices', 4);
    checkAnswer('habits_digital_energy_saving', 5);
    checkAnswer('habits_digital_files', 3);
    checkAnswer('habits_digital_tradein', 1);
    checkAnswer('habits_digital_ewaste', 4);

    // Zajednica
    checkAnswer('habits_community_activities', 2);

    // Prepreke
    checkAnswer('barriers_structural_products', 4);
    checkAnswer('barriers_structural_mobility', 2);
    checkAnswer('barriers_financial_expensive', 5);
    checkAnswer('barriers_informational_confusing', 3);
    checkAnswer('barriers_informational_uninformed', 4);
    checkAnswer('barriers_personal_convenience', 2);
    checkAnswer('barriers_personal_support', 3);
    checkAnswer('barriers_personal_habits', 4);

    // Rubrike (Mobility)
    checkAnswer('mobility_before_rubric', {
      Awareness: 3,
      'Attitude / Motivation': 4,
      Habits: 2,
      'Barriers / Coping': 3,
    });
    checkAnswer('mobility_during_rubric', {
      Awareness: 4,
      'Attitude / Motivation': 5,
      Habits: 4,
      'Barriers / Coping': 4,
    });
    checkAnswer('mobility_after_rubric', {
      Awareness: 5,
      'Attitude / Motivation': 5,
      Habits: 4,
      'Barriers / Coping': 4,
    });
  });
});
