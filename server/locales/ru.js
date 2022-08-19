// @ts-check

export default {
  translation: {
    appName: 'Менеджер задач',
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        edit: {
          error: 'Не удалось изменить пользователя',
          success: 'Пользователь успешно изменён',
        },
        delete: {
          success: 'Пользователь успешно удалён',
          error: 'Не удалось удалить пользователя',
        },
      },
      statuses: {
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус успешно создан',
        },
        edit: {
          error: 'Не удалось изменить статус',
          success: 'Статус успешно изменён',
        },
        delete: {
          success: 'Статус успешно удалён',
          error: 'Не удалось удалить статус',
        },
      },
      tasks: {
        create: {
          error: 'Не удалось создать задачу',
          success: 'Задача успешно создана',
        },
        edit: {
          error: 'Не удалось изменить задачу',
          success: 'Задача успешно изменена',
        },
        delete: {
          success: 'Задача успешно удалена',
          error: 'Задачу может удалить только её автор',
        },
      },
      labels: {
        create: {
          error: 'Не удалось создать метку',
          success: 'Метка успешно создана',
        },
        edit: {
          error: 'Не удалось изменить метку',
          success: 'Метка успешно изменена',
        },
        delete: {
          success: 'Метка успешно удалёна',
          error: 'Не удалось удалить метку',
        },
      },
      accessDenied: 'Вы не можете редактировать или удалять другого пользователя',
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
    layouts: {
      application: {
        users: 'Пользователи',
        statuses: 'Статусы',
        tasks: 'Задачи',
        labels: 'Метки',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      users: {
        id: 'ID',
        email: 'Email',
        password: 'Пароль',
        firstName: 'Имя',
        lastName: 'Фамилия',
        fullName: 'Полное имя',
        createdAt: 'Дата создания',
        actions: {
          heading: 'Действия',
          change: 'Изменить',
          delete: 'Удалить',
        },
        new: {
          signUp: 'Регистрация',
          submit: 'Сохранить',
        },
        edit: {
          title: 'Изменение пользователя',
          submit: 'Изменить',
        },
      },
      statuses: {
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        actions: {
          change: 'Изменить',
          create: 'Создать статус',
          delete: 'Удалить',
        },
        new: {
          title: 'Создание статуса',
          submit: 'Создать',
        },
        edit: {
          title: 'Изменение статуса',
          submit: 'Изменить',
        },
      },
      tasks: {
        id: 'ID',
        name: 'Наименование',
        description: 'Описание',
        status: 'Статус',
        author: 'Автор',
        executor: 'Исполнитель',
        createdAt: 'Дата создания',
        label: 'Метка',
        labels: 'Метки',
        isCreatorUser: 'Только мои задачи',
        actions: {
          create: 'Создать задачу',
          change: 'Изменить',
          delete: 'Удалить',
          view: 'Показать',
        },
        view: {
          title: 'Задача',
        },
        new: {
          title: 'Создание задачи',
          submit: 'Создать',
        },
        edit: {
          title: 'Изменение задачи',
          submit: 'Изменить',
        },
      },
      labels: {
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        actions: {
          change: 'Изменить',
          create: 'Создать метку',
          delete: 'Удалить',
        },
        new: {
          title: 'Создание метки',
          submit: 'Создать',
        },
        edit: {
          title: 'Изменение метки',
          submit: 'Изменить',
        },
      },
      welcome: {
        index: {
          hello: 'Привет от Хекслета!',
          description: 'Практические курсы по программированию',
          more: 'Узнать Больше',
        },
      },
    },
  },
};
