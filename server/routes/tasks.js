// @ts-check
import _ from 'lodash';
import i18next from 'i18next';

export default (app) => {
  app
    .get(
      '/tasks',
      { name: 'tasks', preValidation: app.authenticate },
      async (req, reply) => {
        const { models } = app.objection;
        const query = req.query.data;
        const userId = req.user.id;
        const tasks = await models.task
          .query()
          .withGraphJoined('[status, executor, creator, labels]')
          .modify('filter', query, userId);
        const statuses = await models.taskStatus.query();
        const users = await models.user.query();
        const labels = await models.label.query();

        reply.render('tasks/index', { tasks, statuses, users, labels, selected: query });
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
      const { data } = req.body;
      const creatorId = req.user.id;
      const task = new models.task();
      const statuses = await models.taskStatus.query();
      const users = await models.user.query();
      const labels = await models.label.query();
      task.$set(data);

      try {
        const validTask = await models.task.fromJson({ ...data, creatorId });

        await models.task.transaction(async (trx) => {
          const selectedLabels = _.flatten([data.labels])
            .map((id) => _.toInteger(id))
            .map((id) => ({ id }));

          await models.task.query(trx).upsertGraph({
            ...validTask,
            labels: selectedLabels,
          });
        });

        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
      } catch ({ data: errors }) {
        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.render('tasks/new', {
          task,
          errors: {},
          statuses,
          users,
          labels,
          selected: data,
        });
      }

      return reply;
    })

    .patch(
      '/tasks/:id',
      { name: 'editTaskEndpoint', preValidation: app.authenticate },
      async (req, reply) => {
        const { models } = app.objection;
        const { data } = req.body;
        const taskId = _.toInteger(req.params.id);
        const task = await models.task.query().findById(taskId);
        const statuses = await models.taskStatus.query();
        const users = await models.user.query();
        const labels = await models.label.query();

        try {
          const validTask = await models.task.fromJson(data);

          // const options = { relate: true, unrelate: true };
          const selectedLabels = _.flatten([data.labels])
            .map((id) => _.toInteger(id))
            .map((id) => ({ id }));
          console.log('selectedLabels', selectedLabels);

          await models.task.transaction(async (trx) => {
            await models.task
              .query(trx)
              .upsertGraph(
                {
                  id: taskId,
                  ...validTask,
                  labels: selectedLabels,
                },
                // options,
              )
              .debug();
          });

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
            selected: data,
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
