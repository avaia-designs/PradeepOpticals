import mongoose, { Schema, Document } from 'mongoose';
import { BaseModel } from '../types';

// Shop settings interface extending BaseModel
export interface IShopSettings extends BaseModel {
  appointmentDuration: number; // in minutes
  workingHours: {
    start: string; // Format: "HH:MM"
    end: string;   // Format: "HH:MM"
  };
  workingDays: number[]; // Array of day numbers (0 = Sunday, 1 = Monday, etc.)
  maxAdvanceBookingDays: number; // Maximum days in advance for booking
  slotInterval: number; // Interval between slots in minutes
  isAppointmentBookingEnabled: boolean;
  maxAppointmentsPerDay: number;
  bufferTime: number; // Buffer time between appointments in minutes
}

// Shop settings document interface for Mongoose
export interface IShopSettingsDocument extends Omit<IShopSettings, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Shop settings schema definition
const shopSettingsSchema = new Schema<IShopSettingsDocument>({
  appointmentDuration: {
    type: Number,
    required: true,
    default: 30,
    min: [15, 'Appointment duration must be at least 15 minutes'],
    max: [120, 'Appointment duration cannot exceed 120 minutes']
  },
  workingHours: {
    start: {
      type: String,
      required: true,
      default: '09:00',
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
    },
    end: {
      type: String,
      required: true,
      default: '17:00',
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
    }
  },
  workingDays: {
    type: [Number],
    required: true,
    default: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    validate: {
      validator: function(days: number[]) {
        return days.every(day => day >= 0 && day <= 6);
      },
      message: 'Working days must be between 0 (Sunday) and 6 (Saturday)'
    }
  },
  maxAdvanceBookingDays: {
    type: Number,
    required: true,
    default: 30,
    min: [1, 'Max advance booking days must be at least 1'],
    max: [365, 'Max advance booking days cannot exceed 365']
  },
  slotInterval: {
    type: Number,
    required: true,
    default: 30,
    min: [15, 'Slot interval must be at least 15 minutes'],
    max: [60, 'Slot interval cannot exceed 60 minutes']
  },
  isAppointmentBookingEnabled: {
    type: Boolean,
    required: true,
    default: true
  },
  maxAppointmentsPerDay: {
    type: Number,
    required: true,
    default: 20,
    min: [1, 'Max appointments per day must be at least 1'],
    max: [100, 'Max appointments per day cannot exceed 100']
  },
  bufferTime: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Buffer time cannot be negative'],
    max: [30, 'Buffer time cannot exceed 30 minutes']
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' },
  versionKey: false
});

// Ensure only one settings document exists
shopSettingsSchema.index({}, { unique: true });

// Static method to get current settings
shopSettingsSchema.statics.getCurrentSettings = async function() {
  let settings = await this.findOne();
  
  if (!settings) {
    // Create default settings if none exist
    settings = new this({});
    await settings.save();
  }
  
  return settings;
};

// Static method to update settings
shopSettingsSchema.statics.updateSettings = async function(updates: Partial<IShopSettings>) {
  let settings = await this.findOne();
  
  if (!settings) {
    settings = new this(updates);
  } else {
    Object.assign(settings, updates);
  }
  
  await settings.save();
  return settings;
};

// Instance method to validate working hours
shopSettingsSchema.methods.validateWorkingHours = function() {
  const startHour = parseInt(this.workingHours.start.split(':')[0]);
  const startMinute = parseInt(this.workingHours.start.split(':')[1]);
  const endHour = parseInt(this.workingHours.end.split(':')[0]);
  const endMinute = parseInt(this.workingHours.end.split(':')[1]);
  
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  
  return endTime > startTime;
};

// Instance method to generate available slots for a date
shopSettingsSchema.methods.generateSlotsForDate = function(date: Date) {
  const slots = [];
  const startHour = parseInt(this.workingHours.start.split(':')[0]);
  const startMinute = parseInt(this.workingHours.start.split(':')[1]);
  const endHour = parseInt(this.workingHours.end.split(':')[0]);
  const endMinute = parseInt(this.workingHours.end.split(':')[1]);
  
  const slotDate = new Date(date);
  slotDate.setHours(startHour, startMinute, 0, 0);
  
  const endTime = new Date(date);
  endTime.setHours(endHour, endMinute, 0, 0);
  
  while (slotDate < endTime) {
    const slotStart = new Date(slotDate);
    const slotEnd = new Date(slotDate);
    slotEnd.setMinutes(slotEnd.getMinutes() + this.appointmentDuration);
    
    if (slotEnd <= endTime) {
      slots.push({
        startTime: slotStart.toTimeString().slice(0, 5),
        endTime: slotEnd.toTimeString().slice(0, 5)
      });
    }
    
    slotDate.setMinutes(slotDate.getMinutes() + this.slotInterval);
  }
  
  return slots;
};

// Export the ShopSettings model
export const ShopSettings = mongoose.model<IShopSettingsDocument>('ShopSettings', shopSettingsSchema);
