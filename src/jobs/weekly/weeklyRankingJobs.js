const { getClient } = require('../../services/time.service');


module.exports = {
  name: 'update-weekly-ranking',
  cron: '0 0 * * 1',
  handler: async () => {
    // TODO: Add Weekly Jobs
  },
};
