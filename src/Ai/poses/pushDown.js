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

export default function detectPushUpDownPose(
  pose,
  confidenceThreshold = 0.4,
  smoothWindow = 5
) {
  if (!detectPushUpDownPose.history) detectPushUpDownPose.history = [];
  const history = detectPushUpDownPose.history;

  const getKeypoint = (name) => pose.keypoints.find((k) => k.name === name);

  const names = [
    'left_shoulder', 'left_elbow', 'left_wrist',
    'right_shoulder', 'right_elbow', 'right_wrist'
  ];
  const points = {};

  // Check if all keypoints are confidently detected
  for (const n of names) {
    const kp = getKeypoint(n);
    if (!kp || kp.score < confidenceThreshold) {
      history.push({ detected: false, score: 0 });
      if (history.length > smoothWindow) history.shift();
      return getSmoothedResult(history, smoothWindow);
    }
    points[n] = kp;
  }

  // Compute arm angles (shoulder–elbow–wrist)
  const leftAngle = getAngle(points.left_shoulder, points.left_elbow, points.left_wrist);
  const rightAngle = getAngle(points.right_shoulder, points.right_elbow, points.right_wrist);
  const avgAngle = (leftAngle + rightAngle) / 2;

  // Normalize angle → push down score (100 = perfect 90°, 0 = fully extended)
  const score = angleToPushDownPercent(avgAngle);

  // Determine if currently pushing down (half or more)
  const detected = score >= 40; // 40%+ depth considered a push down

  history.push({ detected, score });
  if (history.length > smoothWindow) history.shift();

  return getSmoothedResult(history, smoothWindow);
}

/**
 * Converts elbow angle to push down percentage (0–100)
 */
function angleToPushDownPercent(angle) {
  // Map angle 180° → 0%, 90° → 100%
  let pct = ((180 - angle) / (180 - 90)) * 100;
  pct = Math.max(0, Math.min(100, pct));

  // Slight penalty for over-bending (<80°)
  if (angle < 80) pct -= (80 - angle) * 1.5;
  return Math.max(0, Math.min(100, pct));
}

/**
 * Smooths results using sliding window average
 */
function getSmoothedResult(history, windowSize) {
  const len = Math.min(history.length, windowSize);
  const avgScore =
    history.reduce((a, b) => a + b.score, 0) / len;
  const trueCount = history.filter((h) => h.detected).length;

  return {
    detected: trueCount > len / 2,
    score: Math.round(avgScore),
  };
}
