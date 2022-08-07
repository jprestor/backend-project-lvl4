import fastify from 'fastify';

import init from '../server/plugin.js';
import { getTestData, prepareData, authUser } from './helpers/index.js';

describe('Test tasks CRUD', () => {
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

  // it('index', async () => {
  //   const response = await app.inject({
  //     method: 'GET',
  //     url: app.reverse('tasks'),
  //     cookies: cookie,
  //   });

  //   console.log('response.data', response.data);

  //   expect(response.statusCode).toBe(200);
  // });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newTask'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  // it('view', async () => {
  //   const params = testData.tasks.existing;
  //   const task = await models.task.query().findOne({ name: params.name });

  //   const response = await app.inject({
  //     method: 'GET',
  //     url: app.reverse('viewTask', { id: task.id }),
  //     cookies: cookie,
  //   });

  //   expect(response.statusCode).toBe(200);
  // });

  it('edit', async () => {
    const params = testData.tasks.existing;
    const task = await models.task.query().findOne({ name: params.name });

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editTask', { id: task.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  // it('create', async () => {
  //   const params = testData.tasks.new;

  //   const response = await app.inject({
  //     method: 'POST',
  //     url: app.reverse('tasks'),
  //     payload: {
  //       data: params,
  //     },
  //   });

  //   expect(response.statusCode).toBe(302);
  //   const task = await models.task.query().findOne({ name: params.name });
  //   expect(task).toMatchObject(params);
  // });

  // it('update', async () => {
  //   const params = testData.tasks.existing;
  //   const task = await models.task.query().findOne({ name: params.name });
  //   const newTaskName = 'New task name';

  //   const response = await app.inject({
  //     method: 'PATCH',
  //     url: app.reverse('editTaskEndpoint', { id: task.id }),
  //     payload: {
  //       data: {
  //         ...params,
  //         name: newTaskName,
  //       },
  //     },
  //     cookies: cookie,
  //   });

  //   expect(response.statusCode).toBe(302);
  //   const reFetchedTask = await task.$query();
  //   expect(reFetchedTask.name).toEqual(newTaskName);
  // });

  // it('delete', async () => {
  //   const params = testData.tasks.existing;
  //   const task = await models.task.query().findOne({ name: params.name });

  //   const responseDelete = await app.inject({
  //     method: 'DELETE',
  //     url: app.reverse('deleteTask', { id: task.id }),
  //     cookies: cookie,
  //   });

  //   expect(responseDelete.statusCode).toBe(302);
  //   const reFetchedTask = await task.$query();
  //   expect(reFetchedTask).toBeUndefined();
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
