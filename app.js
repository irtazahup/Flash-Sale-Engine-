const { Queue } = require('bullmq');
const Redis = require('ioredis');
const express = require('express');

const app = express();
const port = 3000;

// 1. Create Redis connections
const redis = new Redis(); 
// const connection = new Redis(); // Connection specifically for BullMQ
const connection = new Redis({
  maxRetriesPerRequest: null
});
// 2. Setup the Queue
const orderQueue = new Queue('orderQueue', { connection });

const luaScript = `
  local stock = tonumber(redis.call('get', KEYS[1]))
  if stock > 0 then
      redis.call('decr', KEYS[1])
      return 1
  else
      return 0
  end
`;

app.get('/buy', async (req, res) => {
    const userId = req.query.userId || "guest_" + Math.floor(Math.random() * 1000);

    try {
        // Run the Lua script
        const result = await redis.eval(luaScript, 1, "product_stock");

        if (result === 1) {
            // Add to Queue
            await orderQueue.add('processOrder', { 
                userId: userId, 
                productId: '101' 
            });

            res.status(200).send(`<h1>Success!</h1><p>Order for ${userId} is being processed.</p>`);
        } else {
            res.status(410).send("<h1>Sold Out!</h1>");
        }
    } catch (err) {
        console.error(err); // This prints the REAL error to your terminal
        res.status(500).send("Server Error: Check your terminal for details");
    }
});

app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
});