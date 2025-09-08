import mongoose, { Schema, Document } from 'mongoose';
import { BaseModel } from '../types';

// Appointment status enum
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}

// Appointment interface extending BaseModel
export interface IAppointment extends BaseModel {
  appointmentNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  appointmentDate: Date;
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  staffId?: string; // Assigned staff member
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancelledReason?: string;
  completedAt?: Date;
}

// Appointment document interface for Mongoose
export interface IAppointmentDocument extends Omit<IAppointment, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Appointment schema definition
const appointmentSchema = new Schema<IAppointmentDocument>({
  appointmentNumber: {
    type: String,
    required: [true, 'Appointment number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^APT-\d{8}-\d{4}$/, 'Appointment number must be in format APT-YYYYMMDD-XXXX']
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    minlength: [2, 'Customer name must be at least 2 characters long'],
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  customerPhone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
    index: true
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
  },
  status: {
    type: String,
    enum: Object.values(AppointmentStatus),
    default: AppointmentStatus.PENDING,
    index: true
  },
  reason: {
    type: String,
    required: [true, 'Appointment reason is required'],
    trim: true,
    minlength: [10, 'Appointment reason must be at least 10 characters long'],
    maxlength: [500, 'Appointment reason cannot exceed 500 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  staffId: {
    type: String,
    default: null,
    index: true
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancelledReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' },
  versionKey: false
});

// Compound indexes for optimized queries
appointmentSchema.index({ appointmentDate: 1, startTime: 1 });
appointmentSchema.index({ userId: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ staffId: 1, appointmentDate: 1 });

// Pre-save middleware to generate appointment number
appointmentSchema.pre('save', async function(next) {
  if (this.isNew && !this.appointmentNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.appointmentNumber = `APT-${dateStr}-${randomNum}`;
  }
  next();
});

// Pre-save middleware to validate appointment time constraints
appointmentSchema.pre('save', function(next) {
  // Check if appointment is on Sunday
  if (this.appointmentDate.getDay() === 0) {
    return next(new Error('Appointments are not available on Sundays'));
  }

  // Check if appointment time is within business hours (9 AM - 5 PM)
  const startHour = parseInt(this.startTime.split(':')[0]);
  const endHour = parseInt(this.endTime.split(':')[0]);
  
  if (startHour < 9 || endHour > 17) {
    return next(new Error('Appointments must be scheduled between 9 AM and 5 PM'));
  }

  // Check if appointment is at least 30 minutes
  const startMinutes = parseInt(this.startTime.split(':')[1]);
  const endMinutes = parseInt(this.endTime.split(':')[1]);
  const duration = (endHour - startHour) * 60 + (endMinutes - startMinutes);
  
  if (duration < 30) {
    return next(new Error('Appointment duration must be at least 30 minutes'));
  }

  next();
});

// Static method to find appointments by user
appointmentSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ appointmentDate: -1, startTime: -1 });
};

// Static method to find appointments by date range
appointmentSchema.statics.findByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    appointmentDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ appointmentDate: 1, startTime: 1 });
};

// Static method to find available time slots for a date
appointmentSchema.statics.findAvailableSlots = async function(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(9, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(17, 0, 0, 0);

  const existingAppointments = await this.find({
    appointmentDate: {
      $gte: startOfDay,
      $lt: endOfDay
    },
    status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] }
  });

  // Generate 30-minute slots from 9 AM to 5 PM
  const availableSlots = [];
  const current = new Date(startOfDay);
  
  while (current < endOfDay) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current);
    slotEnd.setMinutes(slotEnd.getMinutes() + 30);
    
    const slotStartTime = slotStart.toTimeString().slice(0, 5);
    const slotEndTime = slotEnd.toTimeString().slice(0, 5);
    
    // Check if this slot conflicts with existing appointments
    const hasConflict = existingAppointments.some((apt: IAppointmentDocument) => {
      const aptStart = new Date(apt.appointmentDate);
      aptStart.setHours(parseInt(apt.startTime.split(':')[0]), parseInt(apt.startTime.split(':')[1]));
      
      const aptEnd = new Date(apt.appointmentDate);
      aptEnd.setHours(parseInt(apt.endTime.split(':')[0]), parseInt(apt.endTime.split(':')[1]));
      
      return (slotStart < aptEnd && slotEnd > aptStart);
    });
    
    if (!hasConflict) {
      availableSlots.push({
        startTime: slotStartTime,
        endTime: slotEndTime
      });
    }
    
    current.setMinutes(current.getMinutes() + 30);
  }
  
  return availableSlots;
};

// Instance method to confirm appointment
appointmentSchema.methods.confirm = function(staffId?: string) {
  this.status = AppointmentStatus.CONFIRMED;
  this.confirmedAt = new Date();
  if (staffId) {
    this.staffId = staffId;
  }
  return this.save();
};

// Instance method to cancel appointment
appointmentSchema.methods.cancel = function(reason?: string) {
  this.status = AppointmentStatus.CANCELLED;
  this.cancelledAt = new Date();
  if (reason) {
    this.cancelledReason = reason;
  }
  return this.save();
};

// Instance method to complete appointment
appointmentSchema.methods.complete = function() {
  this.status = AppointmentStatus.COMPLETED;
  this.completedAt = new Date();
  return this.save();
};

// Export the Appointment model
export const Appointment = mongoose.model<IAppointmentDocument>('Appointment', appointmentSchema);
