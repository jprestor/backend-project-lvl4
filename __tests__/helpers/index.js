// @ts-check

import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { faker } from '@faker-js/faker';

import encrypt from '../../server/lib/secure.cjs';

// TODO: использовать для фикстур https://github.com/viglucci/simple-knex-fixtures

const getFixturePath = (filename) => path.join('..', '..', '__fixtures__', filename);
const readFixture = (filename) =>
  fs.readFileSync(new URL(getFixturePath(filename), import.meta.url), 'utf-8').trim();
const getFixtureData = (filename) => JSON.parse(readFixture(filename));

export const getTestData = () => getFixtureData('testData.json');

const generators = {
  user: () => ({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }),
  status: () => ({
    name: faker.word.adjective(),
  }),
  task: () => ({
    name: faker.word.verb(),
    description: faker.lorem.text(),
  }),
};

export function createRandomData(type, length = 1) {
  const data = [];
  const generateData = generators[type];

  Array.from({ length }).forEach(() => {
    data.push(generateData());
  });

  return data;
}

const generateUsersData = () => {
  const newUsers = createRandomData('user');
  const existedUsers = createRandomData('user', 3);
  const seeds = existedUsers.map((user) => ({
    ..._.omit(user, 'password'),
    passwordDigest: encrypt(user.password),
  }));

  return {
    new: newUsers[0],
    existing: {
      creator: existedUsers[0],
      executor: existedUsers[1],
      free: existedUsers[2],
    },
    seeds,
  };
};

const generateStatusesData = () => {
  const newStatuses = createRandomData('status');
  const existedStatuses = createRandomData('status', 2);

  return {
    new: newStatuses[0],
    existing: {
      busy: existedStatuses[0],
      free: existedStatuses[1],
    },
    seeds: existedStatuses,
  };
};

const generateTasksData = (users, statuses) => {
  const [creator, executor] = users;
  const [status] = statuses;

  const mapTasks = (task) => ({
    ...task,
    creatorId: creator.id,
    executorId: executor.id,
    statusId: status.id,
  });

  const newTasks = createRandomData('task').map(mapTasks);
  const existedTasks = createRandomData('task').map(mapTasks);
  return { new: newTasks[0], existing: existedTasks[0], seeds: existedTasks };
};

export const prepareData = async (app) => {
  const { knex } = app.objection;
  const usersData = generateUsersData();
  const statusesData = generateStatusesData();

  await knex('users').insert(usersData.seeds);
  await knex('task_statuses').insert(statusesData.seeds);

  const users = await knex('users');
  const statuses = await await knex('task_statuses');
  const tasksData = generateTasksData(users, statuses);
  await knex('tasks').insert(tasksData.seeds);

  return { users: usersData, statuses: statusesData, tasks: tasksData };
};

export const authUser = async (app, user) => {
  // аутентификация
  const responseSignIn = await app.inject({
    method: 'POST',
    url: app.reverse('session'),
    payload: { data: user },
  });

  // после успешной аутентификации получаем куки из ответа
  const [sessionCookie] = responseSignIn.cookies;
  const { name, value } = sessionCookie;
  const cookie = { [name]: value };

  return cookie;
};
