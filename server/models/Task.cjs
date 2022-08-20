const { Model } = require('objection');
const _ = require('lodash');

const BaseModel = require('./BaseModel.cjs');
const TaskStatus = require('./TaskStatus.cjs');
const User = require('./User.cjs');
const Label = require('./Label.cjs');

module.exports = class Task extends BaseModel {
  static get tableName() {
    return 'tasks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      // required: ['name', 'statusId', 'creatorId'],
      properties: {
        name: { type: 'string', minLength: 1 },
        description: { type: 'string' },
        statusId: { type: 'integer' },
        creatorId: { type: 'integer' },
        executorId: { type: 'integer' },
      },
    };
  }

  $parseJson(json, opt) {
    // Remember to call the super class's implementation.
    json = super.$parseJson(json, opt);
    // Do your conversion here.
    const converted = {
      ..._.omit(json, 'labels'),
      statusId: _.toInteger(json.statusId) || null,
      executorId: _.toInteger(json.executorId) || null,
      creatorId: _.toInteger(json.creatorId) || null,
    };

    return converted;
  }

  static modifiers = {
    async filter(query, filterParams = {}, userId) {
      const { status, executor, label, isCreatorUser } = filterParams;

      if (status) {
        query.where({ statusId: _.toInteger(status) });
      }
      if (executor) {
        query.andWhere({ executorId: _.toInteger(executor) });
      }
      if (label) {
        query.andWhere('labels.id', _.toInteger(label));
      }
      if (isCreatorUser) {
        query.andWhere({ creatorId: userId });
      }
    },
  };

  // This object defines the relations to other models.
  static get relationMappings() {
    return {
      status: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model subclass constructor or an
        // absolute file path to a module that exports one.
        modelClass: TaskStatus,
        join: {
          from: 'tasks.statusId',
          to: 'task_statuses.id',
        },
      },
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'tasks.creatorId',
          to: 'users.id',
        },
      },
      executor: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'tasks.executorId',
          to: 'users.id',
        },
      },
      labels: {
        relation: Model.ManyToManyRelation,
        modelClass: Label,
        join: {
          from: 'tasks.id',
          through: {
            from: 'labels_tasks.taskId',
            to: 'labels_tasks.labelId',
          },
          to: 'labels.id',
        },
      },
    };
  }
};
