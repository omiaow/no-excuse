export const programToExercise = (program) => {
    const timeToSeconds = (timeString) => {
        if (!timeString) return undefined;
        const parts = timeString.split(":").map(Number);
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    return {
        id: program.exercise_id,
        name: program.exercise_name,
        count: 0,
        countLimit: program.max_reps,
        duration: 0,
        durationLimit: timeToSeconds(program.duration),
        sets: 0,
        setsLimit: program.sets_count,
        programTypeId: program.type_id,
        orderNum: program.order_num,
        breakTime: timeToSeconds(program.break_time),
        currentMaxScore: 0,
        totalScore: 0,
        averageScore: 0,
    };
}

export const drawPose = (pose, ctx) => {
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    pose.keypoints.forEach((kp) => {
      if (kp.score > 0.5) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "aqua";
        ctx.fill();
      }
    });
}