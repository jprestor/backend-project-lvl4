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
        const task = new app.objection.models.task();
        const statuses = await app.objection.models.taskStatus.query();
        const users = await app.objection.models.user.query();

        reply.render('tasks/new', { task, statuses, users });
        return reply;
      },
    )

    .get(
      '/tasks/:id/view',
      { name: 'viewTask', preValidation: app.authenticate },
      async (req, reply) => {
        const taskId = req.params.id;
        const task = await app.objection.models.task.query().findById(taskId);
        const statuses = await app.objection.models.taskStatus.query();
        const users = await app.objection.models.user.query();

        reply.render('tasks/view', { task, statuses, users });
        return reply;
      },
    )

    .get(
      '/tasks/:id/edit',
      { name: 'editTask', preValidation: app.authenticate },
      async (req, reply) => {
        const taskId = req.params.id;
        const task = await app.objection.models.task.query().findById(taskId);
        const statuses = await app.objection.models.taskStatus.query();
        const users = await app.objection.models.user.query();

        reply.render('tasks/edit', { task, statuses, users });
        return reply;
      },
    )

    .post('/tasks', { preValidation: app.authenticate }, async (req, reply) => {
      const task = new app.objection.models.task();
      const statuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      const data = {
        ...req.body.data,
        statusId: _.toInteger(req.body.data.statusId) || null,
        executorId: _.toInteger(req.body.data.executorId) || null,
        creatorId: req.user.id,
      };

      task.$set(data);

      try {
        const validStatus = await app.objection.models.task.fromJson(data);
        await app.objection.models.task.query().insert(validStatus);
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
      } catch ({ errorData }) {
        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.render('tasks/new', { task, errors: errorData, statuses, users });
      }

      return reply;
    })

    .patch(
      '/tasks/:id',
      { name: 'editTaskEndpoint', preValidation: app.authenticate },
      async (req, reply) => {
        const taskId = req.params.id;
        const task = await app.objection.models.task.query().findById(taskId);
        const statuses = await app.objection.models.taskStatus.query();
        const users = await app.objection.models.user.query();
        const data = {
          ...req.body.data,
          statusId: _.toInteger(req.body.data.statusId) || null,
          executorId: _.toInteger(req.body.data.executorId) || null,
          creatorId: _.toInteger(req.body.data.creatorId) || null,
        };

        try {
          const validStatus = await app.objection.models.task.fromJson(data);
          await task.$query().update(validStatus);
          console.log('validStatus', validStatus);
          req.flash('info', i18next.t('flash.tasks.edit.success'));
          reply.redirect(app.reverse('tasks'));
        } catch ({ errorData }) {
          req.flash('error', i18next.t('flash.tasks.edit.error'));
          reply.render('tasks/edit', { task, errors: errorData, statuses, users });
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
