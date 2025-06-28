const fs = require('fs');
const path = require('path');
const TimeService = require('../services/time.service');


function loadJobsFrom(subfolder) {
  const folderPath = path.join(__dirname, subfolder);
  if (!fs.existsSync(folderPath)) return;

  const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const job = require(path.join(folderPath, file));

    if (job?.name && job?.cron && typeof job.handler === 'function') {
      TimeService.registerCronJob(job.name, job.cron, job.handler);
      console.log(`[JobLoader] Loaded: ${job.name} from ${subfolder}/${file}`);
    } else {
      console.warn(`[JobLoader] Invalid format in: ${subfolder}/${file}`);
    }
  }
}

function loadAllJobs() {
  	loadJobsFrom('daily');
	loadJobsFrom('weekly');
	loadJobsFrom('monthly');
}

module.exports = loadAllJobs;
