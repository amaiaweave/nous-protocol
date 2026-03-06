import fetch from 'node-fetch';
import { Connection, PublicKey } from '@solana/web3.js';

const GITHUB_HEADERS = {
  'User-Agent': 'NOUS-Protocol',
  ...(process.env.GITHUB_TOKEN && { Authorization: `token ${process.env.GITHUB_TOKEN}` }),
};

// ── GitHub Analysis (55 pts max) ──────────────────────────────────────
async function analyseGitHub(repoUrl) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/\s]+)/);
  if (!match) return { score: 0, detail: { error: 'Invalid GitHub URL' } };
  const [, owner, repo] = match;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`,
    { headers: GITHUB_HEADERS }
  );
  if (!res.ok) return { score: 0, detail: { error: `GitHub ${res.status}` } };

  const commits = await res.json();
  if (!Array.isArray(commits) || commits.length < 3)
    return { score: 0, detail: { error: 'Not enough commits' } };

  const dates = commits.map(c => new Date(c.commit.author.date));
  const oldest = new Date(Math.min(...dates));
  const newest = new Date(Math.max(...dates));
  const daysActive = Math.max(Math.floor((newest - oldest) / 86400000), 1);

  // Shannon entropy across hours of day
  const hourBuckets = Array(24).fill(0);
  dates.forEach(d => hourBuckets[d.getUTCHours()]++);
  let entropy = 0;
  hourBuckets.forEach(c => { if (c > 0) { const p = c / dates.length; entropy -= p * Math.log2(p); } });

  // Interval regularity
  const intervals = [];
  for (let i = 1; i < dates.length; i++)
    intervals.push(Math.abs(dates[i] - dates[i-1]) / 1000);
  const avgInt = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const stdDev = Math.sqrt(intervals.reduce((a, b) => a + (b - avgInt) ** 2, 0) / intervals.length);
  const cv = stdDev / avgInt;

  const daysScore    = Math.min(daysActive / 7, 1) * 15;
  const entropyScore = Math.min(entropy / 4.58, 1) * 20;
  const intervalPts  = (cv < 1.5 ? 1 : 0.5) * 10;
  const msgPts       = Math.min(commits.length / 50, 1) * 10;

  return {
    score: Math.round(daysScore + entropyScore + intervalPts + msgPts),
    detail: { commits: commits.length, daysActive, entropy: entropy.toFixed(2), cv: cv.toFixed(2) },
  };
}

// ── Solana Analysis (45 pts max) ─────────────────────────────────────
async function analyseSolana(walletAddress) {
  try {
    const connection = new Connection(process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com', 'confirmed');
    const pubkey     = new PublicKey(walletAddress);
    const sigs       = await connection.getSignaturesForAddress(pubkey, { limit: 100 });
    if (!sigs.length) return { score: 0, detail: { error: 'No on-chain activity' } };

    const timestamps  = sigs.map(s => s.blockTime * 1000);
    const daysOnChain = Math.max(Math.floor((Math.max(...timestamps) - Math.min(...timestamps)) / 86400000), 1);

    const intervals = [];
    for (let i = 1; i < timestamps.length; i++)
      intervals.push(Math.abs(timestamps[i] - timestamps[i-1]) / 1000);
    const avgInt = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const stdDev = Math.sqrt(intervals.reduce((a, b) => a + (b - avgInt) ** 2, 0) / intervals.length);
    const cv      = stdDev / avgInt;
    const maxGap  = Math.max(...intervals);

    const daysScore    = Math.min(daysOnChain / 7, 1) * 15;
    const regularScore = (cv < 1.5 ? 1 : 0.6) * 15;
    const uptimePts    = (maxGap < 14400 ? 1 : maxGap < 28800 ? 0.8 : 0.5) * 15;

    return {
      score: Math.round(daysScore + regularScore + uptimePts),
      detail: { transactions: sigs.length, daysOnChain, maxGapSec: Math.round(maxGap), cv: cv.toFixed(2) },
    };
  } catch (e) {
    return { score: 0, detail: { error: e.message } };
  }
}

// ── Main ─────────────────────────────────────────────────────────────
export async function runVerification(agent) {
  const [github, solana] = await Promise.all([
    agent.github_repo   ? analyseGitHub(agent.github_repo)      : Promise.resolve({ score: 0, detail: {} }),
    agent.solana_wallet ? analyseSolana(agent.solana_wallet)     : Promise.resolve({ score: 0, detail: {} }),
  ]);

  const nousScore = Math.min(github.score + solana.score, 100);
  return {
    nousScore,
    detail: { github: github.detail, solana: solana.detail, githubScore: github.score, solanaScore: solana.score },
    passed: nousScore >= 70,
  };
}
