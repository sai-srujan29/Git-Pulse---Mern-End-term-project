import mongoose from 'mongoose';

const findingSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['security', 'performance', 'bug', 'style', 'improvement'],
    default: 'improvement',
  },
  severity: {
    type: String,
    enum: ['critical', 'warning', 'info'],
    default: 'info',
  },
  file: {
    type: String,
    default: '',
  },
  line: {
    type: Number,
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  suggestion: {
    type: String,
    default: '',
  },
});

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    repoFullName: {
      type: String,
      required: true,
      index: true,
    },
    pullNumber: {
      type: Number,
      required: true,
    },
    pullTitle: {
      type: String,
      required: true,
    },
    pullAuthor: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      required: true,
    },
    healthScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    breakdown: {
      complexityScore: { type: Number, default: 80 },
      testingScore: { type: Number, default: 80 },
      securityScore: { type: Number, default: 90 },
      docsScore: { type: Number, default: 75 },
    },
    findings: [findingSchema],
    mergeRecommendation: {
      type: String,
      enum: ['ready', 'needs_work', 'blocked'],
      default: 'ready',
    },
    recommendationReason: {
      type: String,
      default: '',
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ repoFullName: 1, pullNumber: 1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
