const mongoose = require('mongoose');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const Service = require('./models/Service');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Vendor.deleteMany();
    await Service.deleteMany();

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@laketana.com',
      password: 'password123',
      role: 'admin'
    });

    // Create Vendor User
    const vendorUser = await User.create({
      name: 'Lake Tana Tours',
      email: 'vendor@laketana.com',
      password: 'password123',
      role: 'vendor'
    });

    // Create Vendor Profile
    const vendor = await Vendor.create({
      user: vendorUser._id,
      businessName: 'Lake Tana Eco-Tours',
      location: 'Bahir Dar, Ethiopia',
      ecoCertification: true,
      description: 'Specializing in monastery island tours and traditional boat rides.',
      status: 'approved'
    });

    // Create Services
    await Service.create([
      {
        vendor: vendor._id,
        title: 'Monastery Island Tour',
        category: 'monastery',
        description: 'Explore ancient monasteries on Lake Tana islands.',
        price: 45,
        ecoFriendly: true,
        images: ['monastry.jpg']
      },
      {
        vendor: vendor._id,
        title: 'Traditional Boat Ride',
        category: 'boat',
        description: 'Experience tankwa papyrus boats.',
        price: 35,
        ecoFriendly: true,
        images: ['Boat.jpg']
      },
      {
        vendor: vendor._id,
        title: 'Blue Nile Falls Trek',
        category: 'waterfall',
        description: 'Guided hike to the Blue Nile Falls.',
        price: 40,
        ecoFriendly: true,
        images: ['waterfall.jpg']
      }
    ]);

    console.log('Data seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
