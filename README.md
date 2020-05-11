# ABLB - The Backend

<img src="https://raw.githubusercontent.com/artscilab/ablb-app/master/public/ablb_color.png" width="256" height="256" title="ABLB Logo">

This is an [express.js](https://expressjs.com) server serving a RESTful API. 

You'll need [node.js](https://nodejs.org) and [yarn](https://yarnpkg.com/) installed to get started developing.

Run `yarn` in the project folder to install dependencies.

Copy `.env.example` into a file called `.env` and fill out the variables to configure the server.

### `yarn dev`

This will start a [nodemon](https://nodemon.io/) server that will watch the project directory for changes and reload your server automatically. 

### `yarn start`

This starts the server, with no watch-and-reload functionality. 

Depends on:
  - MySQL 
  - Client build deployed to `client/build` folder 