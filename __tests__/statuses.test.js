import fastify from 'fastify';

import init from '../server/plugin.js';
import { getTestData, prepareData, authUser } from './helpers/index.js';

describe('Test statuses CRUD', () => {
  let app;
  let knex;
  let models;
  let cookie;
  const testData = getTestData();

  beforeAll(async () => {
    app = fastify();
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;

    // TODO: пока один раз перед тестами
    await knex.migrate.latest();
    await prepareData(app);
  });

  beforeEach(async () => {
    cookie = await authUser(app);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('taskStatuses'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newTaskStatus'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('edit', async () => {
    const params = testData.statuses.existing;
    const status = await models.taskStatus.query().findOne({ name: params.name });

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editTaskStatus', { id: status.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.statuses.new;

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('taskStatuses'),
      payload: {
        data: params,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const status = await models.taskStatus.query().findOne({ name: params.name });
    expect(status).toMatchObject(params);
  });

  it('update', async () => {
    const params = testData.statuses.existing;
    const status = await models.taskStatus.query().findOne({ name: params.name });
    const newStatusName = 'New status';

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('editTaskStatusEndpoint', { id: status.id }),
      payload: {
        data: {
          ...params,
          name: newStatusName,
        },
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const reFetchedStatus = await status.$query();
    expect(reFetchedStatus.name).toEqual(newStatusName);
  });

  // it('delete', async () => {
  //   const params = testData.statuses.existing;
  //   const status = await models.taskStatus.query().findOne({ name: params.name });

  //   const responseDelete = await app.inject({
  //     method: 'DELETE',
  //     url: app.reverse('deleteTaskStatus', { id: status.id }),
  //     cookies: cookie,
  //   });

  //   expect(responseDelete.statusCode).toBe(302);
  //   const reFetchedStatus = await status.$query();
  //   expect(reFetchedStatus).toBeUndefined();
  // });

  afterEach(async () => {
    // Пока Segmentation fault: 11
    // после каждого теста откатываем миграции
    // await knex.migrate.rollback();
  });

  afterAll(async () => {
    await app.close();
  });
});
