import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  platformName: {
    type: String,
    default: 'MockMate AI'
  },
  logoUrl: {
    type: String,
    default: ''
  },
  registrationsEnabled: {
    type: Boolean,
    default: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Create a single document setting helper
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
