import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["employee", "employer", "admin"],
    required: true,
  }, createdAt: { type: Date, default: Date.now },
  // Leave Balances
  leaveBalances: {
    CL: { type: Number, default: 10 },
    PL: { type: Number, default: 10 },
    SL: { type: Number, default: 10 },
    maxCL: { type: Number, default: 10 },
    maxPL: { type: Number, default: 10 },
    maxSL: { type: Number, default: 10 },
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
