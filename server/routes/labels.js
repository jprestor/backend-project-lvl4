// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get(
      '/labels',
      { name: 'labels', preValidation: app.authenticate },
      async (req, reply) => {
        const labels = await app.objection.models.label.query();
        reply.render('labels/index', { labels });
        return reply;
      },
    )

    .get(
      '/labels/new',
      { name: 'newLabel', preValidation: app.authenticate },
      (req, reply) => {
        const status = new app.objection.models.label();
        reply.render('labels/new', { status });
      },
    )

    .get(
      '/labels/:id/edit',
      { name: 'editLabel', preValidation: app.authenticate },
      async (req, reply) => {
        const labelId = req.params.id;
        const label = await app.objection.models.label.query().findById(labelId);

        reply.render('labels/edit', { label });
        return reply;
      },
    )

    .post('/labels', { preValidation: app.authenticate }, async (req, reply) => {
      const status = new app.objection.models.label();
      status.$set(req.body.data);

      try {
        const validStatus = await app.objection.models.label.fromJson(req.body.data);
        await app.objection.models.label.query().insert(validStatus);
        req.flash('info', i18next.t('flash.labels.create.success'));
        reply.redirect(app.reverse('labels'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.create.error'));
        reply.render('labels/new', { status, errors: data });
      }

      return reply;
    })

    .patch(
      '/labels/:id',
      { name: 'editLabelEndpoint', preValidation: app.authenticate },
      async (req, reply) => {
        const labelId = req.params.id;
        const status = await app.objection.models.label.query().findById(labelId);

        try {
          const validStatus = await app.objection.models.label.fromJson(req.body.data);
          await status.$query().update(validStatus);
          req.flash('info', i18next.t('flash.labels.edit.success'));
          reply.redirect(app.reverse('labels'));
        } catch ({ data }) {
          req.flash('error', i18next.t('flash.labels.edit.error'));
          reply.render('labels/edit', { status, errors: data });
        }

        return reply;
      },
    )

    .delete(
      '/labels/:id',
      { name: 'deleteLabel', preValidation: app.authenticate },
      async (req, reply) => {
        const labelId = req.params.id;
        const label = await app.objection.models.label.query().findById(labelId);
        const relatedTasks = await label.$relatedQuery('tasks');
        const isBusy = relatedTasks.length;

        if (isBusy) {
          req.flash('error', i18next.t('flash.labels.delete.error'));
          return reply.redirect(app.reverse('labels'));
        }

        await app.objection.models.label.query().deleteById(labelId);
        req.flash('info', i18next.t('flash.labels.delete.success'));

        return reply.redirect(app.reverse('labels'));
      },
    );
};
