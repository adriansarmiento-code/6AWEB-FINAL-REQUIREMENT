const User = require('../models/User');
const connectDB = require('../config/db');
require('dotenv').config();

const setDefaultServiceArea = async () => {
  try {
    await connectDB();

    // Find all providers without serviceArea set
    const providers = await User.find({
      role: 'provider',
      'providerInfo.serviceArea': { $exists: false }
    });

    console.log(`Found ${providers.length} providers without service area`);

    for (const provider of providers) {
      provider.providerInfo.serviceArea = 'Angeles City Center';
      await provider.save();
      console.log(`✅ Set default area for ${provider.name}`);
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

setDefaultServiceArea();