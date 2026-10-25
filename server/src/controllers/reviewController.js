import { getPullRequestDetails } from '../services/githubService.js';
import { analyzePullRequestWithAI } from '../services/aiService.js';
import Review from '../models/Review.js';

export const analyzePR = async (req, res, next) => {
  try {
    const { owner, repo, pullNumber } = req.body;

    if (!owner || !repo || !pullNumber) {
      return res.status(400).json({
        success: false,
        message: 'owner, repo, and pullNumber are required',
      });
    }

    const prDetails = await getPullRequestDetails(
      req.user._id,
      owner,
      repo,
      pullNumber
    );

    const aiResult = await analyzePullRequestWithAI(prDetails);

    const repoFullName = `${owner}/${repo}`;

    let review = await Review.findOne({
      repoFullName,
      pullNumber,
      userId: req.user._id,
    });

    if (review) {
      review.pullTitle = prDetails.title;
      review.pullAuthor = prDetails.author?.login || '';
      review.summary = aiResult.summary;
      review.healthScore = aiResult.healthScore;
      review.riskLevel = aiResult.riskLevel;
      review.breakdown = aiResult.breakdown;
      review.findings = aiResult.findings;
      review.mergeRecommendation = aiResult.mergeRecommendation;
      review.recommendationReason = aiResult.recommendationReason;
      await review.save();
    } else {
      review = await Review.create({
        userId: req.user._id,
        repoFullName,
        pullNumber,
        pullTitle: prDetails.title,
        pullAuthor: prDetails.author?.login || '',
        summary: aiResult.summary,
        healthScore: aiResult.healthScore,
        riskLevel: aiResult.riskLevel,
        breakdown: aiResult.breakdown,
        findings: aiResult.findings,
        mergeRecommendation: aiResult.mergeRecommendation,
        recommendationReason: aiResult.recommendationReason,
      });
    }

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewHistory = async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    next(error);
  }
};
