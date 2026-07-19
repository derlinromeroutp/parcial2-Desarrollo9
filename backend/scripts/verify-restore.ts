// Asserts a restore drill actually worked, instead of trusting mongorestore's
// exit code alone. connectDB() deliberately swallows connection errors (so
// the app can boot with dbConnected:false), so this script re-checks
// readyState explicitly and exits non-zero on any mismatch.
import mongoose from 'mongoose';
import { connectDB } from '../src/db/connection';
import { Product } from '../src/models/Product';

const EXPECTED_MIN_PRODUCTS = 1;

const run = async () => {
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error(`[verify-restore] Not connected to ${process.env.MONGODB_URI}. readyState=${mongoose.connection.readyState}`);
    process.exit(1);
  }

  const count = await Product.countDocuments();
  console.log(`[verify-restore] Restored database has ${count} product(s)`);

  if (count < EXPECTED_MIN_PRODUCTS) {
    console.error(`[verify-restore] Expected at least ${EXPECTED_MIN_PRODUCTS} product(s), found ${count}. Restore drill FAILED.`);
    process.exit(1);
  }

  console.log('[verify-restore] Restore drill verified OK.');
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('[verify-restore] Unexpected error:', error);
  process.exit(1);
});
