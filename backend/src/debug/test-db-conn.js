require('dotenv').config();

(async()=>{
  const mysql = require('mysql2/promise');
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT||'3306');
  const user = process.env.DB_USER || 'root';
  const pass = process.env.DB_PASSWORD === undefined ? undefined : process.env.DB_PASSWORD;

  console.log('Test connect with password property (value shown as <masked>):', pass === undefined ? 'UNDEFINED' : (pass === '' ? 'EMPTY_STRING' : 'SET'));
  try{
    const conn = await mysql.createConnection({host, port, user, password: pass});
    console.log('Connected OK with password property');
    await conn.end();
  }catch(e){
    console.error('Error with password property:', e.message);
  }

  console.log('\nTest connect omitting password property (no password field)');
  try{
    const conn2 = await mysql.createConnection({host, port, user});
    console.log('Connected OK without password property');
    await conn2.end();
  }catch(e){
    console.error('Error without password property:', e.message);
  }

  process.exit(0);
})();
