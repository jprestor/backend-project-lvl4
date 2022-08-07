// @ts-check

import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';

// TODO: использовать для фикстур https://github.com/viglucci/simple-knex-fixtures

const getFixturePath = (filename) => path.join('..', '..', '__fixtures__', filename);
const readFixture = (filename) =>
  fs.readFileSync(new URL(getFixturePath(filename), import.meta.url), 'utf-8').trim();
const getFixtureData = (filename) => JSON.parse(readFixture(filename));

export const getTestData = () => getFixtureData('testData.json');

export const prepareData = async (app) => {
  const { knex } = app.objection;

  // получаем данные из фикстур и заполняем БД
  await knex('users').insert(getFixtureData('users.json'));
  await knex('task_statuses').insert(getFixtureData('taskStatuses.json'));
};

export const authUser = async (app) => {
  const testData = getTestData();
  const user = testData.users.existing;

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

export function createRandomUser() {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
}

export function createRandomUsers(length = 10) {
  const USERS = [];

  Array.from({ length }).forEach(() => {
    USERS.push(createRandomUser());
  });

  return USERS;
}
