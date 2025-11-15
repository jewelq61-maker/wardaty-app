import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const db = new Database('./wardiya.db');

async function seed() {
  console.log('🌱 Seeding database...');

  // Hash the password
  const hashedPassword = await bcrypt.hash('$123456$', 10);

  // Create test user
  const userId = randomUUID();
  
  try {
    db.prepare(`
      INSERT OR REPLACE INTO profiles (id, email, password, name, persona, locale, theme, is_premium)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, 'a@domo.com', hashedPassword, 'Test User', 'single', 'ar', 'light', 0);

    console.log('✅ Created user: a@domo.com');

    // Create initial cycle
    const cycleId = randomUUID();
    const today = new Date();
    const lastPeriod = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10);
    
    db.prepare(`
      INSERT INTO cycles (id, user_id, start_date, length, duration)
      VALUES (?, ?, ?, ?, ?)
    `).run(cycleId, userId, lastPeriod.toISOString().split('T')[0], 28, 5);

    console.log('✅ Created initial cycle');
    console.log('🎉 Database seeded successfully!');
    console.log('\n📧 Login credentials:');
    console.log('   Email: a@domo.com');
    console.log('   Password: $123456$');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    db.close();
  }
}

seed();
