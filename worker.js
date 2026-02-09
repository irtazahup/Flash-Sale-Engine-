const { Worker } = require('bullmq');
const Redis = require('ioredis');

// const connection = new Redis();
const connection = new Redis({
  maxRetriesPerRequest: null
});

// This worker "listens" to the orderQueue
const worker = new Worker('orderQueue', async (job) => {
    // 3. SIMULATE DATABASE WRITE
    console.log(`[Worker] Processing order for User: ${job.data.userId}...`);
    
    // In a real app, you would do: await db.orders.create(job.data)
    await new Promise(res => setTimeout(res, 500)); // Simulate 500ms DB delay
    
    console.log(`[Worker] Order ${job.id} saved to Database!`);
}, { connection });

console.log("Worker is running and waiting for orders...");