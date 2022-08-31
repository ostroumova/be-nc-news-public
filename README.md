BC-NEWS Backend

Backend part of the app that includes endpoints and tests.

Features:
Users can view list of articles and sort them by properties in descending or ascending order
User can sort articles by topic
User can choose specific article and view it on the separate page with the comments
User can login and post the comment to the specific article
User can upvote or downvote the article
User can delete his own comment


In order to get full Git commits history private keys are required, keys are provided by request.

In order to make this repo works create 2 .env files:
.env.test
.env.develompent

In files define the databeses
PGDATABASE=nc_news_test
PGDATABASE=nc_news 

Link to the hosted version on Heroku - https://dashboard.heroku.com/apps/ostroumova-news

Minimum versions of needed to run the project:
`Node.js` - version 6 and up
`Postgres` - version PostgreSQL 12 and up

Scripts:
"setup-dbs": "psql -f ./db/setup.sql",
"seed": "node ./db/seeds/run-seed.js",
"seed:prod": "NODE_ENV=production DATABASE_URL=$(heroku config:get DATABASE_URL) npm run seed",
"test": "jest"
