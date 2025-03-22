# Крипто Портфель

Веб-приложение для отслеживания криптовалютного портфеля с визуализацией данных в реальном времени.

## Основные функции

### Управление активами
- Добавление новых криптовалют в портфель
- Удаление активов из портфеля
- Автоматическое сохранение данных в локальном хранилище

### Отображение данных
- Общая стоимость портфеля
- Процентное изменение за 24 часа
- Детальная информация по каждому активу:
  - Количество
  - Текущая цена
  - Изменение цены за 24 часа
  - Общая стоимость
  - Доля в портфеле

### Визуализация
1. **График распределения активов**
   - Круговая диаграмма, показывающая долю каждого актива в портфеле
   - Интерактивные подсказки с точными значениями

2. **График изменения цен**
   - Линейный график изменения цен всех активов
   - Цветовая дифференциация линий для разных валют
   - Временная шкала в реальном времени

3. **Детальный график актива**
   - Открывается при клике на строку валюты в таблице
   - Показывает подробную динамику цены выбранного актива
   - Обновляется в реальном времени
   - Отображает точные значения при наведении

## Технические особенности
- Интеграция с Binance WebSocket API для получения данных в реальном времени
- Использование Redux для управления состоянием
- Адаптивный дизайн для мобильных устройств
- Анимации для улучшения пользовательского опыта

## Используемые технологии
- React
- TypeScript
- Redux Toolkit
- Recharts
- SCSS Modules
- WebSocket API
- Framer Motion

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
