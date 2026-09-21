# Car Sharing API

A REST API for managing a car-sharing fleet, implemented according to the technical specification: tracking vehicles, their statuses, current rides, and booking history.

## Tech Stack

- **Node.js** + **Express** — server and REST API
- **MongoDB** + **Mongoose** — database and ODM
- **Swagger** (swagger-ui-express, swagger-jsdoc) — API documentation
- **Docker** / **Docker Compose** — containerization and deployment

## Getting Started

**Docker Desktop** must be installed to run the project.

```bash
docker-compose up --build
```

This command spins up two containers:

- `mongo` — the MongoDB database (port `27017`);
- `app` — the Node.js application (port `3000`).

Once started, the API is available at [http://localhost:3000](http://localhost:3000).

## API Documentation

Full interactive Swagger documentation is available after startup at:

```
http://localhost:3000/api-docs
```

There you can explore all endpoints and test them directly from the browser.

## Note on Data

On startup, the `app` container automatically clears the database and seeds it with test vehicles using the [`seed.js`](seed.js) script. No manual data setup is required — after `docker-compose up --build`, the data is ready to use.
