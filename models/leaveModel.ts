import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    toEmail: { type: String, required: true },
    leaveType: { type: String, enum: ['CL', 'SL', 'PL'], required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  },
  { timestamps: true }
);

export default mongoose.models.Leave || mongoose.model('Leave', leaveSchema);
