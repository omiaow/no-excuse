import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

import isStanding from './standing';
import isSquat from './squat';

export default function SquatCounter() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);

  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("Loading model...");

  // Refs to store current state values that don’t reset each frame
  const myPoseRef = useRef(true);
  const stableFramesRef = useRef(0);

  useEffect(() => {
    async function init() {
      await tf.setBackend("webgl");
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      );
      detectorRef.current = detector;

      const video = videoRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      video.srcObject = stream;

      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve).catch((err) => {
            console.warn("Auto-play prevented:", err);
            resolve();
          });
        };
      });

      setStatus("MoveNet ready — start squatting!");
      runDetection();
    }

    init();
  }, []);

  async function runDetection() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const detect = async () => {
      if (detectorRef.current && video.readyState === 4) {
        const poses = await detectorRef.current.estimatePoses(video);
        if (poses[0]) {
          drawPose(poses[0], ctx);
          checkSquat(poses[0]);
        }
      }
      requestAnimationFrame(detect);
    };
    detect();
  }

  function drawPose(pose, ctx) {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    pose.keypoints.forEach((kp) => {
      if (kp.score > 0.5) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "aqua";
        ctx.fill();
      }
    });
  }

  function checkSquat(pose) {
    const squatResult = isSquat(pose);
    const standingResult = isStanding(pose);

    const isSquatting = squatResult.isSquatting;
    const isStandingNow = standingResult;

    const stableFrames = stableFramesRef.current;
    const currentPose = myPoseRef.current;

    if (currentPose) {
      // Standing → Squatting
      if (isSquatting) {
        stableFramesRef.current++;
        if (stableFrames > 3) {
          myPoseRef.current = false;
          stableFramesRef.current = 0;
        }
      } else {
        stableFramesRef.current = 0;
      }
    } else {
      // Squatting → Standing
      if (isStandingNow) {
        stableFramesRef.current++;
        if (stableFrames > 3) {
          myPoseRef.current = true;
          stableFramesRef.current = 0;
          setCount((prev) => prev + 1); // ✅ functional update
        }
      } else {
        stableFramesRef.current = 0;
      }
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-2">{status}</h2>
      <h1 className="text-3xl font-bold mb-4">Squats: {count}</h1>
      <div style={{ position: "relative" }}>
        <video
          ref={videoRef}
          style={{ width: 320, height: 240, borderRadius: 12 }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 320,
            height: 240,
          }}
        />
      </div>
    </div>
  );
}
