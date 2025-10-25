// --- helper to compute the angle between three points ---
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

// --- main smoother and detector ---
export default function isStandingSmooth(
  pose,
  confidenceThreshold = 0.3,
  straightLegAngle = 165,
  smoothWindow = 5 // number of recent frames to average
) {
  // static-like memory to smooth out transitions
  if (!isStandingSmooth.history) isStandingSmooth.history = [];
  const history = isStandingSmooth.history;

  const getKeypoint = (name) => pose.keypoints.find((k) => k.name === name);

  const names = ['left_hip', 'left_knee', 'left_ankle', 'right_hip', 'right_knee', 'right_ankle'];
  const points = {};

  for (const n of names) {
    const kp = getKeypoint(n);
    if (!kp || kp.score < confidenceThreshold) {
      // store false in history and return smoothed result
      history.push(false);
      if (history.length > smoothWindow) history.shift();
      return history.filter(Boolean).length > smoothWindow / 2;
    }
    points[n] = kp;
  }

  const leftAngle = getAngle(points.left_hip, points.left_knee, points.left_ankle);
  const rightAngle = getAngle(points.right_hip, points.right_knee, points.right_ankle);

  const isStanding = leftAngle >= straightLegAngle && rightAngle >= straightLegAngle;

  // --- smoothing logic ---
  history.push(isStanding);
  if (history.length > smoothWindow) history.shift();

  // return majority vote of last N frames
  const trueCount = history.filter(Boolean).length;
  return trueCount > smoothWindow / 2;
}
