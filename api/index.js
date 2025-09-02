const app = require('../tourism_app/node-server/src/app');

module.exports = (req, res) => {
  return app(req, res);
};


