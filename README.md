# Task-app

An webapp for creating task boards. Includes user account creation, inviting user to boards with varying permissions, and websocket for synchronizing users working on same board.

Hosted at:
https://task-app-3lqj.onrender.com

Api can be viewed at:
https://task-app-3lqj.onrender.com/api

## Using this app

App is using postgres as database, to run it you need to set it up locally, and modify the backend app enviromental variable. After that, to start run the following command:

```sh
yarn install
yarn dev
```

Your local app will be hosted by default at:
http://localhost:5173/

Backend app includes swagger, which will be available at:
http://localhost:3000/api

## What's inside?

This Turborepo includes the following packages and apps:

### Apps and Packages

- `backend`: an [NestJs](https://nestjs.com/) server
- `frontend`: a [Vite](https://vitejs.dev/) single page app
- `shared-types`: common types like dtos, shared by frontend and backend
- `shared-consts`: common values, like validation rules, shared by frontend and backend
