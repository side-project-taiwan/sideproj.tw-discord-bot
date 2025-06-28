const cron = require('node-cron');
const cronJobs = [];

let discordClient = null;


function setClient(client) {
  discordClient = client;
}


function getClient() {
  if (!discordClient) {
    throw new Error('[TimeService] Discord client is not set');
  }
  return discordClient;
}


function registerCronJob(name, cronExpr, handler) {
  if (cronJobs.some(job => job.name === name)) {
    console.warn(`[TimeService] Job "${name}" is already registered.`);
    return;
  }
  cronJobs.push({ name, cronExpr, handler });
}


function startAllCronJobs() {
  console.log(`[TimeService] Starting ${cronJobs.length} cron jobs...`);
  for (const job of cronJobs) {
    console.log(`Registered Job: ${job.name} (${job.cronExpr})`);
    cron.schedule(job.cronExpr, async () => {
      console.log(`Starting cron job: ${job.name}`);
      try {
        await job.handler();
        console.log(`Finished cron job: ${job.name}`);
      } catch (err) {
        console.error(`Error in cron job: ${job.name}`, err);
      }
    });
  }
}


module.exports = {
  setClient,
  getClient,
  registerCronJob,
  startAllCronJobs,
};
