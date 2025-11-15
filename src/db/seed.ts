import { db, generateId } from './client';
import { profiles, cycles, cycleDays } from './schema';
import * as bcrypt from 'bcryptjs';

// Seed the database with test user
async function seed() {
  console.log('🌱 Seeding database...');

  // Hash the password
  const hashedPassword = await bcrypt.hash('$123456$', 10);

  // Create test user
  const userId = generateId();
  
  try {
    await db.insert(profiles).values({
      id: userId,
      email: 'a@domo.com',
      password: hashedPassword,
      name: 'Test User',
      persona: 'single',
      locale: 'ar',
      theme: 'light',
      isPremium: false,
    });

    console.log('✅ Created user: a@domo.com');

    // Create initial cycle
    const cycleId = generateId();
    const today = new Date();
    const lastPeriod = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10);
    
    await db.insert(cycles).values({
      id: cycleId,
      userId: userId,
      startDate: lastPeriod.toISOString().split('T')[0],
      length: 28,
      duration: 5,
    });

    console.log('✅ Created initial cycle');
    console.log('🎉 Database seeded successfully!');
    console.log('\n📧 Login credentials:');
    console.log('   Email: a@domo.com');
    console.log('   Password: $123456$');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seed();
