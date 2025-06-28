const { getClient } = require('../../services/time.service');


module.exports = {
  name: 'update-daily-ranking',
  cron: '0 0 * * *',
  handler: async () => {
    // TODO: Add Daily Jobs
  },
};
