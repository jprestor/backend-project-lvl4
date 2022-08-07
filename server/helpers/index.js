// @ts-check

import i18next from 'i18next';
import _ from 'lodash';

export default (app) => ({
  route(name, params) {
    return app.reverse(name, params);
  },
  t(key) {
    return i18next.t(key);
  },
  _,
  getTaskStatus(statuses, refId) {
    const status = _.find(statuses, ({ id }) => id === refId);
    return status.name;
  },
  getUserName(users, refId) {
    const user = _.find(users, ({ id }) => id === refId);
    const { firstName, lastName } = user;
    return `${firstName} ${lastName}`;
  },
  getAlertClass(type) {
    switch (type) {
      // case 'failure':
      //   return 'danger';
      case 'error':
        return 'danger';
      case 'success':
        return 'success';
      case 'info':
        return 'info';
      default:
        throw new Error(`Unknown flash type: '${type}'`);
    }
  },
  formatDate(str) {
    const date = new Date(str);
    return date.toLocaleString();
  },
});
