// seed.js – creates demo users and requests if they don't exist yet
// Safe to run multiple times (idempotent via email uniqueness)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const { User, BloodRequest, DonorResponse } = require('./models');

async function seed() {
  await connectDB();

  const hash = pwd => bcrypt.hash(pwd, 10);

  // ── Admin ──────────────────────────────────────────────────────────────────
  const [adminHash] = await Promise.all([hash('Admin@123')]);
  const admin = await User.findOneAndUpdate(
    { email: 'admin@blood.com' },
    { name: 'Admin', email: 'admin@blood.com', passwordHash: adminHash, role: 'admin' },
    { upsert: true, new: true }
  );

  // ── Hospital ───────────────────────────────────────────────────────────────
  const hospitalHash = await hash('Hospital@123');
  const hospital = await User.findOneAndUpdate(
    { email: 'hospital@blood.com' },
    {
      name: 'City Care Hospital',
      email: 'hospital@blood.com',
      passwordHash: hospitalHash,
      role: 'hospital',
      phone: '9000000001',
      city: 'Mumbai',
    },
    { upsert: true, new: true }
  );

  // ── Donors ─────────────────────────────────────────────────────────────────
  const donorPassword = await hash('Donor@123');
  const donorData = [
    { name: 'Ravi Kumar', email: 'donor@blood.com', bloodGroup: 'B+', city: 'Mumbai', phone: '9100000001' },
    { name: 'Priya Sharma', email: 'donor2@blood.com', bloodGroup: 'A+', city: 'Delhi', phone: '9100000002' },
    { name: 'Amit Singh', email: 'donor3@blood.com', bloodGroup: 'O+', city: 'Pune', phone: '9100000003' },
    { name: 'Sneha Patel', email: 'donor4@blood.com', bloodGroup: 'AB+', city: 'Bangalore', phone: '9100000004' },
    { name: 'Rohan Mehta', email: 'donor5@blood.com', bloodGroup: 'A-', city: 'Mumbai', phone: '9100000005' },
    { name: 'Kavita Nair', email: 'donor6@blood.com', bloodGroup: 'B-', city: 'Chennai', phone: '9100000006' },
  ];

  for (const d of donorData) {
    await User.findOneAndUpdate(
      { email: d.email },
      { ...d, passwordHash: donorPassword, role: 'donor', isAvailable: true },
      { upsert: true }
    );
  }

  // ── Sample Blood Requests ──────────────────────────────────────────────────
  const requestData = [
    { bloodGroup: 'B+', units: 2, city: 'Mumbai', urgency: 'urgent', note: 'Required for surgery tomorrow' },
    { bloodGroup: 'A+', units: 3, city: 'Delhi', urgency: 'normal', note: 'Scheduled transfusion' },
    { bloodGroup: 'O+', units: 5, city: 'Mumbai', urgency: 'critical', note: 'Emergency trauma case' },
  ];

  for (const r of requestData) {
    // Only create if no open request of same group+city already exists (avoid flooding on restart)
    const exists = await BloodRequest.findOne({ hospital: hospital._id, bloodGroup: r.bloodGroup, city: r.city, status: 'open' });
    if (!exists) {
      await BloodRequest.create({ ...r, hospital: hospital._id });
    }
  }

  console.log('✅ Seed complete');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
