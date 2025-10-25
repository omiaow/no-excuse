function getAngle(pA, pB, pC) {
  const baX = pA.x - pB.x;
  const baY = pA.y - pB.y;
  const bcX = pC.x - pB.x;
  const bcY = pC.y - pB.y;

  const dot = baX * bcX + baY * bcY;
  const magBA = Math.hypot(baX, baY);
  const magBC = Math.hypot(bcX, bcY);

  if (magBA === 0 || magBC === 0) return 180;

  let cosine = dot / (magBA * magBC);
  cosine = Math.max(-1, Math.min(1, cosine));

  return Math.acos(cosine) * (180 / Math.PI);
}

/**
 * Detects squat pose and returns squat percentage
 * @param {Object} pose - Movenet pose with keypoints
 * @param {number} confidenceThreshold - minimum keypoint score
 * @param {number} smoothWindow - smoothing window size (frames)
 * @returns {{isSquatting: boolean, squatScore: number}} 
 */
export default function detectSquatPose(
  pose,
  confidenceThreshold = 0.4,
  smoothWindow = 5
) {
  if (!detectSquatPose.history) detectSquatPose.history = [];
  const history = detectSquatPose.history;

  const getKeypoint = (name) => pose.keypoints.find((k) => k.name === name);

  const names = [
    'left_hip', 'left_knee', 'left_ankle',
    'right_hip', 'right_knee', 'right_ankle'
  ];
  const points = {};

  // Check if all keypoints are confidently detected
  for (const n of names) {
    const kp = getKeypoint(n);
    if (!kp || kp.score < confidenceThreshold) {
      history.push({ isSquatting: false, squatScore: 0 });
      if (history.length > smoothWindow) history.shift();
      return getSmoothedResult(history, smoothWindow);
    }
    points[n] = kp;
  }

  // Compute leg angles (hip–knee–ankle)
  const leftAngle = getAngle(points.left_hip, points.left_knee, points.left_ankle);
  const rightAngle = getAngle(points.right_hip, points.right_knee, points.right_ankle);
  const avgAngle = (leftAngle + rightAngle) / 2;

  // Normalize angle → squat score (100 = perfect 90°, 0 = fully standing)
  const squatScore = angleToSquatPercent(avgAngle);

  // Determine if currently squatting (half or more)
  const isSquatting = squatScore >= 40; // 40%+ depth considered a squat

  history.push({ isSquatting, squatScore });
  if (history.length > smoothWindow) history.shift();

  return getSmoothedResult(history, smoothWindow);
}

/**
 * Converts knee angle to squat percentage (0–100)
 */
function angleToSquatPercent(angle) {
  // Map angle 180° → 0%, 90° → 100%
  let pct = ((180 - angle) / (180 - 90)) * 100;
  pct = Math.max(0, Math.min(100, pct));

  // Slight penalty for over-squatting (<80°)
  if (angle < 80) pct -= (80 - angle) * 1.5;
  return Math.max(0, Math.min(100, pct));
}

/**
 * Smooths results using sliding window average
 */
function getSmoothedResult(history, windowSize) {
  const len = Math.min(history.length, windowSize);
  const avgScore =
    history.reduce((a, b) => a + b.squatScore, 0) / len;
  const trueCount = history.filter((h) => h.isSquatting).length;

  return {
    isSquatting: trueCount > len / 2,
    squatScore: Math.round(avgScore),
  };
}
