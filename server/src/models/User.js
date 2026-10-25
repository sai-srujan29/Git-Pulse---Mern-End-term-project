import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    displayName: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    profileUrl: {
      type: String,
      default: '',
    },
    accessToken: {
      type: String,
      required: true,
      select: false,
    },
    bio: {
      type: String,
      default: '',
    },
    publicRepos: {
      type: Number,
      default: 0,
    },
    followers: {
      type: Number,
      default: 0,
    },
    following: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
