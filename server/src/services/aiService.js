import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/config.js';

let genAI = null;
if (config.gemini.apiKey) {
  genAI = new GoogleGenerativeAI(config.gemini.apiKey);
}

const buildHeuristicReview = (prDetails) => {
  const stats = prDetails.stats || {};
  const additions = stats.additions || 0;
  const deletions = stats.deletions || 0;
  const changedFiles = stats.changedFiles || 0;
  const totalDiff = additions + deletions;

  const hasTests = prDetails.files?.some(
    (f) =>
      f.filename.includes('test') ||
      f.filename.includes('spec') ||
      f.filename.includes('__tests__')
  );

  const hasDocs = prDetails.files?.some(
    (f) =>
      f.filename.toLowerCase().includes('readme') ||
      f.filename.toLowerCase().includes('.md') ||
      f.filename.toLowerCase().includes('doc')
  );

  let complexityScore = 95;
  if (totalDiff > 1000 || changedFiles > 20) complexityScore = 55;
  else if (totalDiff > 500 || changedFiles > 10) complexityScore = 70;
  else if (totalDiff > 200 || changedFiles > 5) complexityScore = 85;

  let testingScore = hasTests ? 92 : 65;
  let docsScore = hasDocs ? 90 : 70;
  let securityScore = 95;

  const findings = [];

  const sensitivePattern = /(api[_-]?key|secret|password|bearer|private_key)\s*[:=]\s*['"][^'"]+['"]/i;
  prDetails.files?.forEach((file) => {
    if (file.patch && sensitivePattern.test(file.patch)) {
      securityScore -= 30;
      findings.push({
        type: 'security',
        severity: 'critical',
        file: file.filename,
        line: 1,
        title: 'Potential Hardcoded Secret Detected',
        description: `Possible secret, key, or credential found in diff for ${file.filename}.`,
        suggestion: 'Store credentials in environment variables or secret manager.',
      });
    }

    if (file.additions > 300) {
      findings.push({
        type: 'style',
        severity: 'warning',
        file: file.filename,
        line: 1,
        title: 'Large File Diff',
        description: `This file has ${file.additions} added lines. Consider breaking this into smaller modular components.`,
        suggestion: 'Refactor into smaller single-responsibility modules.',
      });
    }
  });

  if (!hasTests && totalDiff > 50) {
    findings.push({
      type: 'improvement',
      severity: 'warning',
      file: prDetails.files?.[0]?.filename || '',
      line: null,
      title: 'Missing Unit or Integration Tests',
      description: 'Significant logic was added without corresponding unit test updates.',
      suggestion: 'Add automated tests covering new branches and error cases.',
    });
  }

  const overallScore = Math.round(
    complexityScore * 0.35 +
      testingScore * 0.25 +
      securityScore * 0.3 +
      docsScore * 0.1
  );

  let riskLevel = 'low';
  let mergeRecommendation = 'ready';
  let recommendationReason = 'All automated health checks passed cleanly.';

  if (overallScore < 65 || securityScore < 70) {
    riskLevel = 'high';
    mergeRecommendation = 'blocked';
    recommendationReason = 'High risk detected. Address security and testing findings before merging.';
  } else if (overallScore < 80) {
    riskLevel = 'medium';
    mergeRecommendation = 'needs_work';
    recommendationReason = 'Consider addressing complexity and testing feedback before final merge.';
  }

  return {
    summary: `Pull Request #${prDetails.number} introduces ${totalDiff} lines of change across ${changedFiles} files with ${prDetails.stats?.commitsCount || 1} commit(s).`,
    healthScore: overallScore,
    riskLevel,
    breakdown: {
      complexityScore,
      testingScore,
      securityScore,
      docsScore,
    },
    findings,
    mergeRecommendation,
    recommendationReason,
  };
};

export const analyzePullRequestWithAI = async (prDetails) => {
  if (!genAI) {
    return buildHeuristicReview(prDetails);
  }

  try {
    const diffSummary = prDetails.files
      ?.slice(0, 15)
      .map((f) => `File: ${f.filename} (+${f.additions}/-${f.deletions})\n${f.patch?.slice(0, 800) || 'No diff text'}`)
      .join('\n---\n');

    const prompt = `
You are an expert senior software architect conducting an automated Pull Request Code Review & Health Audit.
Analyze the following GitHub Pull Request and return your evaluation strictly as a valid JSON object.

PR Details:
- Title: ${prDetails.title}
- Description: ${prDetails.body || 'No description provided'}
- Author: ${prDetails.author?.login}
- Head Branch: ${prDetails.head?.ref} -> Base: ${prDetails.base?.ref}
- Additions: ${prDetails.stats?.additions}, Deletions: ${prDetails.stats?.deletions}, Changed Files: ${prDetails.stats?.changedFiles}

Diff Sample:
${diffSummary || 'No diffs provided'}

Instructions:
Evaluate code cleanliness, anti-patterns, security risks, test coverage, and documentation.
Respond ONLY with a JSON object in this exact schema (no markdown blocks, no backticks, raw JSON only):
{
  "summary": "2-3 concise sentences summarizing what this PR accomplishes and its architectural impact",
  "healthScore": 0-100 integer representing overall PR quality,
  "riskLevel": "low" | "medium" | "high",
  "breakdown": {
    "complexityScore": 0-100 integer,
    "testingScore": 0-100 integer,
    "securityScore": 0-100 integer,
    "docsScore": 0-100 integer
  },
  "findings": [
    {
      "type": "security" | "performance" | "bug" | "style" | "improvement",
      "severity": "critical" | "warning" | "info",
      "file": "file path",
      "line": line number or null,
      "title": "short finding title",
      "description": "deep technical explanation",
      "suggestion": "concrete code fix or refactor recommendation"
    }
  ],
  "mergeRecommendation": "ready" | "needs_work" | "blocked",
  "recommendationReason": "explanation for merge recommendation"
}
`;

    const modelCandidates = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-flash-latest'];
    let result = null;
    let lastError = null;

    for (const modelName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        if (result && result.response) break;
      } catch (err) {
        lastError = err;
        console.warn(`Gemini model ${modelName} failed, trying next candidate...`);
      }
    }

    if (!result || !result.response) {
      throw lastError || new Error('All Gemini model candidates failed');
    }

    let text = result.response.text();

    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(text);

    return {
      summary: parsed.summary || 'PR reviewed by Gemini AI.',
      healthScore: Math.min(100, Math.max(0, Number(parsed.healthScore) || 85)),
      riskLevel: ['low', 'medium', 'high'].includes(parsed.riskLevel) ? parsed.riskLevel : 'low',
      breakdown: {
        complexityScore: parsed.breakdown?.complexityScore || 80,
        testingScore: parsed.breakdown?.testingScore || 80,
        securityScore: parsed.breakdown?.securityScore || 90,
        docsScore: parsed.breakdown?.docsScore || 75,
      },
      findings: Array.isArray(parsed.findings) ? parsed.findings : [],
      mergeRecommendation: ['ready', 'needs_work', 'blocked'].includes(parsed.mergeRecommendation)
        ? parsed.mergeRecommendation
        : 'ready',
      recommendationReason: parsed.recommendationReason || 'Automated audit complete.',
    };
  } catch (error) {
    console.warn('Gemini API call failed, falling back to heuristic engine:', error.message);
    return buildHeuristicReview(prDetails);
  }
};
