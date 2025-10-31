import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

import isStanding from './poses/standing';
import isSquat from './poses/squat';

import isPushUp from './poses/pushUp';
import isPushDown from './poses/pushDown';

export default function SmartCounter({ exercise, setExercise, handleClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState("Loading model...");
  const [timerInterval, setTimerInterval] = useState(null);

  const [count, setCount] = useState(exercise.count);
  const [duration, setDuration] = useState(exercise.duration);
  const countRef = useRef(exercise.count);
  const durationRef = useRef(exercise.duration);

  const exerciseFunctions = {
    'squat': {
      initialPose: isStanding,
      actionPose: isSquat
    },
    'push-up': {
      initialPose: isPushUp,
      actionPose: isPushDown
    }
  };

  const myPoseRef = useRef(true);
  const stableFramesRef = useRef(0);

  const startTimer = () => {
    if (timerInterval) return;
    
    const interval = setInterval(() => {
      setDuration((prev) => {
        durationRef.current = prev + 1;
        return prev + 1;
      });
    }, 1000);
    
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  useEffect(() => {
    async function init() {
      await tf.setBackend("webgl");
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      );
      detectorRef.current = detector;

      const video = videoRef.current;
      
      if (!video) {
        console.error("Video element not found");
        setStatus("Error: Video element not found");
        return;
      }
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
      } catch (frontCameraError) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } },
          });
        } catch (backCameraError) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        }
      }
      
      if (!stream) {
        setStatus("Error: No camera found. Please enable camera access.");
        return;
      }
      
      streamRef.current = stream;
      video.srcObject = stream;

      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve).catch(() => {
            resolve();
          });
        };
      });

      setStatus("MoveNet ready — start exercising!");
      startTimer();
      runDetection();
    }

    init();

    return () => {
      setExercise((prev) => ({ ...prev, count: countRef.current, duration: durationRef.current }));

      stopTimer();
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [setExercise]);

  async function runDetection() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const detect = async () => {
      if (!canvasRef.current || !videoRef.current) return;
      
      if (detectorRef.current && video.readyState === 4) {
        const poses = await detectorRef.current.estimatePoses(video);
        if (poses[0] && canvasRef.current) {
          drawPose(poses[0], ctx);
          checkExercise(poses[0]);
        }
      }
      animationFrameRef.current = requestAnimationFrame(detect);
    };
    detect();
  }

  function drawPose(pose, ctx) {
    if (!canvasRef.current) return;
    
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

  function checkExercise(pose) {

    const stableFrames = stableFramesRef.current;
    const currentPose = myPoseRef.current;

    if (currentPose) {
      const result = exerciseFunctions[exercise.name].actionPose(pose);
      const isDetected = result.detected;
      
      if (isDetected) {
        stableFramesRef.current++;
        if (stableFrames > 3) {
          myPoseRef.current = false;
          stableFramesRef.current = 0;
        }
      } else {
        stableFramesRef.current = 0;
      }
    } else {
      const result = exerciseFunctions[exercise.name].initialPose(pose);
      
      if (result) {
        stableFramesRef.current++;
        if (stableFrames > 3) {
          myPoseRef.current = true;
          stableFramesRef.current = 0;
          setCount((prev) => {
            countRef.current = prev + 1;
            return prev + 1;
          });
        }
      } else {
        stableFramesRef.current = 0;
      }
    }
  }

  if (exercise.durationLimit !== null && duration === exercise.durationLimit) {
    handleClose();
    return <></>;
  }

  // Video container with overlay
  return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '80vh',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        borderRadius: '0px 0px 30px 30px'
      }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '20px 40px',
          borderRadius: '20px',
          border: '3px solid #ff0000',
          boxShadow: '0 0 20px rgba(255, 0, 0, 0.5)'
        }}>
          <div style={{
            fontSize: '64px',
            fontWeight: '900',
            color: '#ff0000',
            textShadow: '0 0 10px rgba(255, 0, 0, 0.8), 0 0 20px rgba(255, 0, 0, 0.6)',
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '2px'
          }}>
            {count}
          </div>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '15px 25px',
          borderRadius: '15px',
          border: '2px solid #00ff00',
          boxShadow: '0 0 15px rgba(0, 255, 0, 0.5)'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#00ff00',
            textShadow: '0 0 5px rgba(0, 255, 0, 0.8)',
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center'
          }}>
            {exercise.durationLimit !== null 
              ? Math.floor((exercise.durationLimit - duration) / 60) + ':' + ((exercise.durationLimit - duration) % 60).toString().padStart(2, '0')
              : Math.floor(duration / 60) + ':' + (duration % 60).toString().padStart(2, '0')
            }
          </div>
          <div style={{
            fontSize: '12px',
            color: '#00ff00',
            textAlign: 'center',
            marginTop: '5px',
            opacity: 0.8
          }}>
          </div>
        </div>

        {(status === "Loading model..." || status.includes("Error")) && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              textAlign: 'center',
              padding: '20px'
            }}>
              <h2 style={{
                fontSize: '18px',
                color: '#fff',
                marginBottom: '10px'
              }}>{status}</h2>
            </div>
          </div>
        )}
      </div>
  );
}