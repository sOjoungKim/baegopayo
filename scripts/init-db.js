const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  try {
    console.log('DB 연결 중...');
    const sql = fs.readFileSync(path.join(__dirname, '../db/init.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ DB 초기화 완료!');
  } catch (err) {
    console.error('❌ 에러:', err.message);
  } finally {
    await pool.end();
  }
}

initDB();