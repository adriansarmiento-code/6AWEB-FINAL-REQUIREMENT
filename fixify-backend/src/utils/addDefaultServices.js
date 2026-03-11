const User = require('../models/User');
const connectDB = require('../config/db');
require('dotenv').config();

const getDefaultServicesByCategory = (category) => {
  const serviceTemplates = {
    plumbing: [
      { name: 'Emergency Leak Repair', description: 'Fix urgent leaks and pipe issues', price: 800 },
      { name: 'Drain Cleaning', description: 'Unclog drains and sewers', price: 500 },
      { name: 'Fixture Installation', description: 'Install sinks, faucets, toilets', price: 1000 },
    ],
    electrical: [
      { name: 'Wiring Repair', description: 'Fix electrical wiring issues', price: 1200 },
      { name: 'Outlet Installation', description: 'Install new electrical outlets', price: 600 },
      { name: 'Light Fixture Setup', description: 'Install ceiling lights and fixtures', price: 800 },
    ],
    cleaning: [
      { name: 'Deep Cleaning', description: 'Thorough cleaning of entire space', price: 1500 },
      { name: 'Regular Cleaning', description: 'Standard cleaning service', price: 800 },
      { name: 'Move-in/Move-out', description: 'Cleaning for moving situations', price: 2000 },
    ],
    carpentry: [
      { name: 'Furniture Repair', description: 'Fix broken furniture', price: 900 },
      { name: 'Custom Cabinet', description: 'Build custom cabinets', price: 3000 },
      { name: 'Door Installation', description: 'Install or repair doors', price: 1500 },
    ],
  };

  return serviceTemplates[category] || [
    { name: 'General Service', description: 'Basic service offering', price: 500 },
  ];
};

const addServicesToProviders = async () => {
  try {
    await connectDB();

    // Find all providers without services
    const providers = await User.find({
      role: 'provider',
      'providerInfo.services': { $exists: false }
    });

    console.log(`Found ${providers.length} providers without services`);

    for (const provider of providers) {
      const category = provider.providerInfo?.category || 'other';
      const defaultServices = getDefaultServicesByCategory(category);
      
      provider.providerInfo.services = defaultServices;
      await provider.save();
      
      console.log(`✅ Added services to ${provider.name} (${category})`);
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

addServicesToProviders();