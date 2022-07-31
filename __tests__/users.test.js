import _ from 'lodash';
import fastify from 'fastify';

import init from '../server/plugin.js';
import encrypt from '../server/lib/secure.cjs';
import { getTestData, prepareData } from './helpers/index.js'; // createRandomUsers

describe('test users CRUD', () => {
  let app;
  let knex;
  let models;
  const testData = getTestData();

  beforeAll(async () => {
    app = fastify({ logger: { prettyPrint: true } });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;

    // TODO: пока один раз перед тестами
    // тесты не должны зависеть друг от друга
    // перед каждым тестом выполняем миграции
    // и заполняем БД тестовыми данными
    await knex.migrate.latest();
    await prepareData(app);
  });

  beforeEach(async () => {});

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newUser'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('edit', async () => {
    const params = testData.users.existing;
    const user = await models.user.query().findOne({ email: params.email });

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editUser', { id: user.id }),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.users.new;

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);

    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const user = await models.user.query().findOne({ email: params.email });
    expect(user).toMatchObject(expected);
  });

  it('update', async () => {
    const params = testData.users.existing;
    const user = await models.user.query().findOne({ email: params.email });
    const newFirstName = 'Jane';

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('editUserEndpoint', { id: user.id }),
      payload: {
        data: {
          ...params,
          firstName: newFirstName,
        },
      },
    });

    expect(response.statusCode).toBe(302);

    const reFetchedUser = await user.$query();
    expect(reFetchedUser.firstName).toEqual(newFirstName);
  });

  it('delete', async () => {
    const params = testData.users.existing;
    const user = await models.user.query().findOne({ email: params.email });

    // аутентификация под пользователем которого хотим удалить
    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: testData.users.existing,
      },
    });

    // после успешной аутентификации получаем куки из ответа
    const [sessionCookie] = responseSignIn.cookies;
    const { name, value } = sessionCookie;
    const cookie = { [name]: value };

    const responseDelete = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteUser', { id: user.id }),
      cookies: cookie,
    });

    expect(responseDelete.statusCode).toBe(302);

    const reFetchedUser = await user.$query();
    expect(reFetchedUser).toBeUndefined();
  });

  afterEach(async () => {
    // Пока Segmentation fault: 11
    // после каждого теста откатываем миграции
    // await knex.migrate.rollback();
  });

  afterAll(async () => {
    await app.close();
  });
});
