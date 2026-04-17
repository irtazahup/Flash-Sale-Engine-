# Flash Sale Queue System

A minimal flash-sale backend that prevents overselling under high concurrency.

This project demonstrates a production-style pattern for handling burst traffic:
- Atomic stock check/decrement in Redis via Lua script
- Fast API response path
- Asynchronous order processing with BullMQ workers

## Tech Stack

- Node.js
- Express
- Redis
- BullMQ
- ioredis
- k6 (for load testing)

## Project Structure

```text
.
├── app.js       # API server (/buy endpoint)
├── worker.js    # Background worker that processes queued orders
├── test.js      # k6 load test script
├── package.json
└── README.md
```

## How It Works

1. A user calls `GET /buy`.
2. The API runs a Redis Lua script against `product_stock`.
3. The script atomically:
   - reads current stock
   - decrements if stock > 0
   - returns success/failure
4. If success, API enqueues an order job (`processOrder`) in BullMQ.
5. A BullMQ worker consumes jobs and simulates a database write.
6. If stock is depleted, API returns `410 Sold Out`.

This pattern keeps inventory correctness in a high-concurrency scenario and offloads slower work to background processing.

## Prerequisites

- Node.js 18+
- Redis running locally on default port (`6379`)
- k6 installed (optional, only for load testing)

## Installation

```bash
npm install
```

## Start Redis

Make sure Redis is running before starting the app and worker.

Example (Docker):

```bash
docker run --name flash-sale-redis -p 6379:6379 -d redis:7
```

## Initialize Product Stock

Set initial stock in Redis before testing:

```bash
redis-cli SET product_stock 100
```

You can verify with:

```bash
redis-cli GET product_stock
```

## Run the Application

Open two terminals.

1. Start API server:

```bash
node app.js
```

2. Start worker:

```bash
node worker.js
```

API will be available at:

```text
http://localhost:3000
```

## API Reference

### `GET /buy`

Attempts to buy one unit of product `101`.

#### Query Parameters

- `userId` (optional): Buyer identifier

If omitted, server assigns a random guest ID.

#### Success Response

- Status: `200 OK`
- Body: HTML success message

#### Sold Out Response

- Status: `410 Gone`
- Body: `Sold Out!`

#### Error Response

- Status: `500 Internal Server Error`
- Body: generic error message

## Load Testing with k6

The included `test.js` script simulates 50 virtual users for 10 seconds.

Run:

```bash
k6 run test.js
```

Before running, reset stock to a known value:

```bash
redis-cli SET product_stock 100
```

## Important Notes

- `test.js` is a k6 script (not a Node.js unit test file).
- `package.json` currently has no real `npm test` command.
- `main` in `package.json` is set to `index.js`, but the entry server file is `app.js`.

## Suggested Improvements

- Add environment variables for host/port/Redis settings.
- Add graceful shutdown handling for worker and Redis connections.
- Add retries, dead-letter queue, and job idempotency keys.
- Store orders in a real database.
- Add monitoring/metrics for queue depth and processing latency.
- Replace HTML responses with JSON for API clients.

## License

ISC
