// @ts-check
import _ from 'lodash';
import i18next from 'i18next';

export default (app) => {
  app
    .get(
      '/tasks',
      { name: 'tasks', preValidation: app.authenticate },
      async (req, reply) => {
        const tasks = await app.objection.models.task.query();
        const statuses = await app.objection.models.taskStatus.query();
        const users = await app.objection.models.user.query();

        reply.render('tasks/index', { tasks, statuses, users });
        return reply;
      },
    )

    .get(
      '/tasks/new',
      { name: 'newTask', preValidation: app.authenticate },
      async (req, reply) => {
        const { models } = app.objection;

        const task = new models.task();
        const statuses = await models.taskStatus.query();
        const users = await models.user.query();
        const labels = await models.label.query();

        reply.render('tasks/new', {
          task,
          statuses,
          users,
          labels,
        });
        return reply;
      },
    )

    .get(
      '/tasks/:id/view',
      { name: 'viewTask', preValidation: app.authenticate },
      async (req, reply) => {
        const taskId = req.params.id;
        const task = await app.objection.models.task.query().findById(taskId);
        const status = await task.$relatedQuery('status');
        const creator = await task.$relatedQuery('creator');
        const executor = await task.$relatedQuery('executor');
        const labels = await task.$relatedQuery('labels');

        reply.render('tasks/view', {
          task,
          status,
          creator,
          executor,
          labels,
        });
        return reply;
      },
    )

    .get(
      '/tasks/:id/edit',
      { name: 'editTask', preValidation: app.authenticate },
      async (req, reply) => {
        const { models } = app.objection;

        const taskId = req.params.id;
        const task = await models.task.query().findById(taskId);
        const statuses = await models.taskStatus.query();
        const users = await models.user.query();
        const labels = await models.label.query();
        const selectedLabels = _.map(await task.$relatedQuery('labels'), 'id');

        const { statusId, executorId } = task;
        const selected = {
          statusId: [statusId],
          executorId: [executorId],
          labels: selectedLabels,
        };

        reply.render('tasks/edit', {
          task,
          statuses,
          users,
          selected,
          labels,
        });
        return reply;
      },
    )

    .post('/tasks', { preValidation: app.authenticate }, async (req, reply) => {
      const { models } = app.objection;

      const task = new models.task();
      const statuses = await models.taskStatus.query();
      const users = await models.user.query();
      const labels = await models.label.query();

      const data = {
        ..._.omit(req.body.data, 'labels'),
        statusId: _.toInteger(req.body.data.statusId) || null,
        executorId: _.toInteger(req.body.data.executorId) || null,
        creatorId: req.user.id,
      };
      task.$set(data);

      const selectedLabels = _.map(_.flatten([req.body.data.labels]), _.toInteger);
      const selected = {
        statusId: [data.statusId],
        executorId: [data.executorId],
        labels: selectedLabels,
      };

      try {
        const validTask = await models.task.fromJson(data);

        if (selectedLabels) {
          await models.task.transaction(async (trx) => {
            const newTask = await models.task.query(trx).insert(validTask);

            await Promise.all(
              selectedLabels.map((labelId) =>
                models.labelTask.query(trx).insert({ taskId: newTask.id, labelId }),
              ),
            );
          });
        } else {
          await models.task.query().insert(validTask);
        }

        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
      } catch ({ data: errors }) {
        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.render('tasks/new', {
          task,
          errors,
          statuses,
          users,
          labels,
          selected,
        });
      }

      return reply;
    })

    .patch(
      '/tasks/:id',
      { name: 'editTaskEndpoint', preValidation: app.authenticate },
      async (req, reply) => {
        const { models } = app.objection;

        const taskId = _.toInteger(req.params.id);
        const task = await models.task.query().findById(taskId);
        const statuses = await models.taskStatus.query();
        const users = await models.user.query();
        const labels = await models.label.query();

        const data = {
          ..._.omit(req.body.data, 'labels'),
          statusId: _.toInteger(req.body.data.statusId) || null,
          executorId: _.toInteger(req.body.data.executorId) || null,
          creatorId: _.toInteger(req.body.data.creatorId) || null,
        };

        const selectedLabels = _.map(_.flatten([req.body.data.labels]), _.toInteger);
        const selected = {
          statusId: [data.statusId],
          executorId: [data.executorId],
          labels: selectedLabels,
        };

        try {
          const validTask = await models.task.fromJson(data);

          if (selectedLabels) {
            await models.task.transaction(async (trx) => {
              await task.$query(trx).update(validTask);
              const taskLabels = await models.labelTask.query(trx).where({ taskId });

              await Promise.all(
                taskLabels.map((taskLabel) => taskLabel.$query(trx).delete()),
              );

              await Promise.all(
                selectedLabels.map((selectedLabel) =>
                  models.labelTask.query(trx).insert({ labelId: selectedLabel, taskId }),
                ),
              );
            });
          } else {
            await task.$query().update(validTask);
          }

          req.flash('info', i18next.t('flash.tasks.edit.success'));
          reply.redirect(app.reverse('tasks'));
        } catch ({ data: errors }) {
          req.flash('error', i18next.t('flash.tasks.edit.error'));
          reply.render('tasks/edit', {
            task,
            errors,
            statuses,
            users,
            labels,
            selected,
          });
        }

        return reply;
      },
    )

    .delete(
      '/tasks/:id',
      { name: 'deleteTask', preValidation: app.authenticate },
      async (req, reply) => {
        const taskId = req.params.id;
        const task = await app.objection.models.task.query().findById(taskId);
        const { id: creatorId } = await task.$relatedQuery('creator');
        const { id: userId } = req.user;

        if (creatorId !== userId) {
          req.flash('error', i18next.t('flash.tasks.delete.error'));
          return reply.redirect(app.reverse('tasks'));
        }

        await app.objection.models.task.query().deleteById(req.params.id);
        req.flash('info', i18next.t('flash.tasks.delete.success'));
        return reply.redirect(app.reverse('tasks'));
      },
    );
};
