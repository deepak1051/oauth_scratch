import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ['google', 'github'], required: true },
    providerId: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
