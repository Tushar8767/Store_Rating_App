// Creates the tables and inserts demo data. Run with: npm run db:setup
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

const users = [
  ['System Administrator Account', 'admin@storerating.com', 'Admin@123', '1 Admin Street, Pune, Maharashtra', 'admin'],
  ['Rahul Sharma Kulkarni Jr', 'rahul.sharma@example.com', 'Rahul@123', '12 MG Road, Pune, Maharashtra', 'user'],
  ['Priya Venkatesh Iyer Nair', 'priya.iyer@example.com', 'Priya@123', '45 Anna Salai, Chennai, Tamil Nadu', 'user'],
  ['Amit Kumar Verma Singhania', 'amit.verma@example.com', 'Amit@1234', '8 Park Street, Kolkata, West Bengal', 'user'],
  ['Sneha Deshmukh Patil Joshi', 'sneha.patil@example.com', 'Sneha@123', '77 FC Road, Pune, Maharashtra', 'user'],
  ['Green Basket Store Owner One', 'owner.greenbasket@example.com', 'Owner@123', '3 Market Lane, Pune, Maharashtra', 'owner'],
  ['Book Nook Store Owner Number', 'owner.booknook@example.com', 'Owner@123', '19 College Road, Chennai, Tamil Nadu', 'owner'],
  ['Tech Hub Store Owner Person', 'owner.techhub@example.com', 'Owner@123', '5 Brigade Road, Bengaluru, Karnataka', 'owner'],
];

// [name, email, address, owner email]
const stores = [
  ['Green Basket Groceries', 'contact@greenbasket.com', '3 Market Lane, Pune, Maharashtra', 'owner.greenbasket@example.com'],
  ['Book Nook', 'hello@booknook.com', '19 College Road, Chennai, Tamil Nadu', 'owner.booknook@example.com'],
  ['Tech Hub Electronics', 'sales@techhub.com', '5 Brigade Road, Bengaluru, Karnataka', 'owner.techhub@example.com'],
  ['City Pharmacy', 'info@citypharmacy.com', '22 Station Road, Pune, Maharashtra', null],
];

// [user email, store email, rating]
const ratings = [
  ['rahul.sharma@example.com', 'contact@greenbasket.com', 5],
  ['priya.iyer@example.com', 'contact@greenbasket.com', 4],
  ['amit.verma@example.com', 'contact@greenbasket.com', 3],
  ['sneha.patil@example.com', 'contact@greenbasket.com', 4],
  ['rahul.sharma@example.com', 'hello@booknook.com', 4],
  ['priya.iyer@example.com', 'hello@booknook.com', 5],
  ['amit.verma@example.com', 'sales@techhub.com', 2],
  ['sneha.patil@example.com', 'sales@techhub.com', 3],
];

async function run() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);

  const ids = {};
  for (const [name, email, password, address, role] of users) {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, address, role) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [name, email, hash, address, role]
    );
    ids[email] = result.rows[0].id;
  }

  const storeIds = {};
  for (const [name, email, address, ownerEmail] of stores) {
    const ownerId = ownerEmail ? ids[ownerEmail] : null;
    const result = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1,$2,$3,$4) RETURNING id',
      [name, email, address, ownerId]
    );
    storeIds[email] = result.rows[0].id;
  }

  for (const [userEmail, storeEmail, rating] of ratings) {
    await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1,$2,$3)', [
      ids[userEmail],
      storeIds[storeEmail],
      rating,
    ]);
  }

  console.log('Database ready: schema created and demo data inserted.');
  await pool.end();
}

run().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
