const fs = require('fs')
fs.writeFileSync('./.env', `DB_URL=${process.env.DB_URL}\n`)