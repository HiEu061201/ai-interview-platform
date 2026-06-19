import mongoose from 'mongoose';
import { StudyCategory, StudyMaterial } from './models/StudyMaterial';
import { config } from './config/env';

// Utility to create slug from string
const generateSlug = (text: string) => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

const runSeeder = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // 1. Setup Study Categories
    const categories = [
      { name: 'System Design', slug: 'system-design', description: 'Thiết kế hệ thống lớn', displayOrder: 1 },
      { name: 'Cấu trúc dữ liệu và giải thuật', slug: 'dsa', description: 'Data structures and algorithms', displayOrder: 2 },
      { name: 'Behavioral', slug: 'behavioral', description: 'Câu hỏi hành vi', displayOrder: 3 },
      { name: 'JavaScript & Frontend', slug: 'javascript-frontend', description: 'Kiến thức web frontend', displayOrder: 4 },
      { name: 'Node.js & Backend', slug: 'nodejs-backend', description: 'Kiến thức backend', displayOrder: 5 },
    ];

    for (const catData of categories) {
      let cat = await StudyCategory.findOne({ name: catData.name });
      if (!cat) {
        cat = await StudyCategory.create(catData);
        console.log(`Created category: ${cat.name}`);
      } else {
        if (!cat.slug) {
          cat.slug = catData.slug;
          await cat.save();
          console.log(`Updated slug for category: ${cat.name}`);
        }
      }
    }

    // 2. Setup Some Study Materials
    const sysCat = await StudyCategory.findOne({ slug: 'system-design' });
    if (sysCat) {
      const mat = await StudyMaterial.findOne({ slug: 'intro-to-system-design' });
      if (!mat) {
        await StudyMaterial.create({
          category: sysCat._id,
          title: 'Giới thiệu về System Design',
          slug: 'intro-to-system-design',
          content: 'Đây là tài liệu cơ bản về System Design...\n\n1. Scalability\n2. Load Balancing\n3. Caching',
          displayOrder: 1,
        });
        console.log('Created StudyMaterial: intro-to-system-design');
      }
    }

    console.log('Seeder completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeder failed:', error);
    process.exit(1);
  }
};

runSeeder();
