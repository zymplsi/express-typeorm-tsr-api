#Project Assigment

### Teacher Student Registration API

## Background

Teachers need a system where they can perform administrative functions for their students. Teachers and students are identified by their email addresses.

#### Install

```sh
$ git clone https://github.com/zymplsi/express-typeorm-tsr-api.git
$ cd express-typeorm-tsr-api
$ npm install
$ npm run start:dev
```

Launch the browser to http://localhost:3000/api-docs

#### Local DB setup (MacOS)

1. install MySQL
   https://dev.mysql.com/downloads/mysql/
2. (Optional) Install MySQL WorkBench
   https://dev.mysql.com/downloads/workbench/
3. Set the MySQL connection to the app. The json file for the database connection configuration can be found at ormconfig.json

```json
{
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "password",
  "database": "test"
}
```

4.  Start the MySQL server and test the connection to the running app.
5.  Create the database `test`.


#### Unit Tests

There are unit tests for the 4 API controllers.

```sh
$ npm run test
```

### API Explorer

The API endpoints are available on the API Explorer at http://localhost:3000/api-docs
