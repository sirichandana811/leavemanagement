// models/leaveModel.ts
import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  leaveType: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' }
});

export default mongoose.models.Leave || mongoose.model('Leave', leaveSchema);
