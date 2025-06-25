const { getClient } = require('../../services/time.service');


module.exports = {
  name: 'update-monthly-jobs',
  cron: '0 0 1 * *',
  handler: async () => {
    // TODO: Add Monthly Jobs
  },
};
