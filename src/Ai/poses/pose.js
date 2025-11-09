import isStanding from './standing';
import isSquat from './squat';
import isPushUp from './pushUp';
import isPushDown from './pushDown';

export default {
  '1': {
    initialPose: isPushUp,
    actionPose: isPushDown,
    name: 'push-up',
  },
  '2': {
    initialPose: isStanding,
    actionPose: isSquat,
    name: 'squat',
  },
};