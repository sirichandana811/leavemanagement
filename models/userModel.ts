import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: true, select: false }, // Hidden by default
  role: { type: String, enum: ['admin', 'employee', 'employer'], default: 'employee' },
  totalLeaves: { type: Number, default: 20 },
  leavesTaken: { type: Number, default: 0 },
});

export default mongoose.models.User || mongoose.model('User', userSchema);
