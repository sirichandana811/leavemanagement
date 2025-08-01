import mongoose from "mongoose";

const policySchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  maxCL: { type: Number, default: 0 },
  maxSL: { type: Number, default: 0 },
  maxPL: { type: Number, default: 0 },
  currentCL: { type: Number, default: 0 },
  currentSL: { type: Number, default: 0 },
  currentPL: { type: Number, default: 0 },
});

export default mongoose.models.Policy || mongoose.model("Policy", policySchema);
