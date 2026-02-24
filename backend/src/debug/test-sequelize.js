require('dotenv').config();
const sequelize = require('../config/database');

(async()=>{
  try{
    console.log('Testing Sequelize authenticate()...');
    await sequelize.authenticate();
    console.log('Sequelize connected OK');
    process.exit(0);
  }catch(e){
    console.error('Sequelize error:', e.message);
    if (e.parent) console.error('Parent:', e.parent.message);
    process.exit(1);
  }
})();
