# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

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

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Backend Integration

This frontend currently talks to five backend surfaces:

- `GET /cars` for the car list and car detail
- `GET|POST|DELETE /collections` for the user collection
- `POST|DELETE /likes` for likes
- `POST /crawl_*` and `POST /add` for crawler/admin helpers
- `GET /poll-crawler-logs` for crawler logs

The sibling backend in [../LaicaiApi](/Users/zhuodiao/workplace/LaicaiApi) already has matching route groups:

- `cars` REST API in `lib/contructs/lambdas/cars/CarsApiConstruct.ts`
- `collections` and `likes` HTTP API in `lib/contructs/apis/CollectionRoutes.ts`
- crawler helper APIs in `lib/contructs/apis/CrawlerApiConstruct.ts`
- additional data helper API in `lib/contructs/apis/AdditionalDataHelperApiConstruct.ts`
- crawler log polling API in `lib/contructs/apis/CrawlerLoggingConstruct.ts`
- authenticated user profile API under `/users/*` in `lib/contructs/apis/UserFastApiConstruct.ts`

To point this frontend at your own backend deployment, set these variables in `.env`:

```env
REACT_APP_CAR_API_BASE_URL=http://localhost:4000
REACT_APP_COLLECTION_API_BASE_URL=http://localhost:4001
REACT_APP_USER_API_BASE_URL=http://localhost:4001
REACT_APP_CRAWLER_API_BASE_URL=http://localhost:4002
REACT_APP_ADDITIONAL_DATA_API_BASE_URL=http://localhost:4003
REACT_APP_LOG_API_BASE_URL=http://localhost:4004
```

Notes:

- `REACT_APP_COLLECTION_API_BASE_URL` must point to an API that accepts `Authorization: Bearer <cognito-access-token>`.
- `REACT_APP_USER_API_BASE_URL` must point to a deployed backend that actually serves `/users` and uses the same Cognito user pool and app client as the frontend.
- The current collection backend reads the user from JWT claims, while the car API currently accepts `userId` as a query/body value.
- If you want a single local backend origin instead of multiple URLs, keep the same routes and set all five variables to the same base URL.
- If your local backend uses different paths or auth, update the API files under [src/api](/Users/zhuodiao/workplace/malo/src/api) to match.
