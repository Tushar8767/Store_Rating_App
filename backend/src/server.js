const app = require('./app');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy .env.example to .env and set it.');
  process.exit(1);
}

const autoMigrate = require('../db/autoMigrate');

const port = process.env.PORT || 5000;
app.listen(port, async () => {
  console.log(`API [${process.env.INSTANCE_ID || 'single'}] running on http://localhost:${port}`);
  if (process.env.AUTO_MIGRATE === 'true') {
    await autoMigrate();
  }
});
