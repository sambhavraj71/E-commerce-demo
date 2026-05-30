const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');

dotenv.config();

const categories = [
  { name: 'Custom Apparel', description: 'Tailored fits, premium fabrics, and long-lasting prints/embroidery', level: 0, order: 1 },
  { name: 'T-Shirts & Shirts', description: 'Custom printed t-shirts and shirts', parent: 'Custom Apparel', level: 1, order: 1 },
  { name: 'Hoodies', description: 'Premium hoodies with custom prints', parent: 'Custom Apparel', level: 1, order: 2 },
  { name: 'Track Suits', description: 'Comfortable track suits', parent: 'Custom Apparel', level: 1, order: 3 },
  
  { name: 'Print on Demand', description: 'Zero inventory stress - DTF, DTG, screen, and sublimation', level: 0, order: 2 },
  { name: 'DTF', description: 'Direct to film printing', parent: 'Print on Demand', level: 1, order: 1 },
  { name: 'DTG', description: 'Direct to garment printing', parent: 'Print on Demand', level: 1, order: 2 },
  { name: 'Screen', description: 'Screen printing', parent: 'Print on Demand', level: 1, order: 3 },
  { name: 'Sublimation', description: 'Sublimation printing', parent: 'Print on Demand', level: 1, order: 4 },
  
  { name: 'Uniforms', description: 'Professional programs with size runs, fabric choices, and compliance', level: 0, order: 3 },
  { name: 'Hospital', description: 'Hospital uniforms', parent: 'Uniforms', level: 1, order: 1 },
  { name: 'Hotel', description: 'Hotel staff uniforms', parent: 'Uniforms', level: 1, order: 2 },
  { name: 'School', description: 'School uniforms', parent: 'Uniforms', level: 1, order: 3 },
  
  { name: 'Corporate Gifts', description: 'Curated kits that pair apparel with branded utilities', level: 0, order: 4 },
  { name: 'Welcome Kits', description: 'New employee welcome kits', parent: 'Corporate Gifts', level: 1, order: 1 },
  { name: 'Festive', description: 'Festival gift sets', parent: 'Corporate Gifts', level: 1, order: 2 },
  { name: 'Executive', description: 'Premium executive gifts', parent: 'Corporate Gifts', level: 1, order: 3 },
  { name: 'Eco', description: 'Eco-friendly gift options', parent: 'Corporate Gifts', level: 1, order: 4 },
  
  { name: 'Accessories', description: 'Brand-forward add-ons with embroidery/print options', level: 0, order: 5 },
  { name: 'Cap', description: 'Custom caps', parent: 'Accessories', level: 1, order: 1 },
  { name: 'Tote Bags', description: 'Custom tote bags', parent: 'Accessories', level: 1, order: 2 },
  { name: 'Bottle', description: 'Custom water bottles', parent: 'Accessories', level: 1, order: 3 },
  { name: 'Diary', description: 'Custom diaries', parent: 'Accessories', level: 1, order: 4 },
  { name: 'Pen', description: 'Custom pens', parent: 'Accessories', level: 1, order: 5 },
  { name: 'Key Chains', description: 'Custom key chains', parent: 'Accessories', level: 1, order: 6 },
  { name: 'Customized Cups', description: 'Customized cups and mugs', parent: 'Accessories', level: 1, order: 7 },
  { name: 'Shoes', description: 'Custom shoes', parent: 'Accessories', level: 1, order: 8 },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');
    
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');
    
    // Create categories
    const createdCategories = [];
    for (const cat of categories) {
      const category = await Category.create(cat);
      createdCategories.push(category);
      console.log(`Created category: ${cat.name}`);
    }
    
    // Update parent references
    const parentMap = {
      'Mobiles': 'Electronics',
      'Laptops': 'Electronics',
      'Audio': 'Electronics',
      'Men': 'Fashion',
      'Women': 'Fashion',
      'Kids': 'Fashion',
      'Furniture': 'Home & Living',
      'Decor': 'Home & Living',
      'Kitchen': 'Home & Living',
      'Skincare': 'Beauty',
      'Makeup': 'Beauty',
      'Fitness': 'Sports',
      'Outdoor': 'Sports'
    };
    
    for (const [child, parent] of Object.entries(parentMap)) {
      const childCat = await Category.findOne({ name: child });
      const parentCat = await Category.findOne({ name: parent });
      if (childCat && parentCat) {
        childCat.parent = parentCat._id;
        await childCat.save();
        console.log(`Set ${child} parent to ${parent}`);
      }
    }
    
    console.log('Category seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();