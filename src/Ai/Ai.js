import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

import isStanding from './poses/standing';
import isSquat from './poses/squat';

import isPushUp from './poses/pushUp';
import isPushDown from './poses/pushDown';

export default function SmartCounter({ exercise = 'push-up' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isMountedRef = useRef(true);

  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("Loading model...");

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

  // Refs to store current state values that don’t reset each frame
  const myPoseRef = useRef(true);
  const stableFramesRef = useRef(0);

  useEffect(() => {
    let videoEl = null;
    let stream = null;
  
    async function init() {
      await tf.setBackend("webgl");
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      );
      detectorRef.current = detector;
  
      videoEl = videoRef.current;
      if (!videoEl) {
        console.error("Video element not found");
        setStatus("Error: Video element not found");
        return;
      }
  
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
      } catch (frontCameraError) {
        console.warn("Front camera not available, trying back camera:", frontCameraError);
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } },
          });
        } catch (backCameraError) {
          console.warn("Back camera not available, trying default:", backCameraError);
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
      }
  
      if (!stream) {
        setStatus("Error: No camera found. Please enable camera access.");
        return;
      }
  
      // store references locally
      videoEl.srcObject = stream;
  
      await new Promise((resolve) => {
        videoEl.onloadedmetadata = () => {
          videoEl.play().then(resolve).catch((err) => {
            console.warn("Auto-play prevented:", err);
            resolve();
          });
        };
      });
  
      setStatus("MoveNet ready — start exercising!");
      runDetection();
    }
  
    init();
  
    // ✅ Cleanup (camera turn off)
    return async () => {
      isMountedRef.current = false;
  
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (detectorRef.current) {
        detectorRef.current.dispose();
        detectorRef.current = null;
      }
      
      if (tf.backend()) {
        await tf.backend().dispose(); // optional, frees GPU memory
      }
  
      // use local references
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
  
      if (videoEl) {
        videoEl.srcObject = null;
      }
    };
  }, []);
  

  async function runDetection() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const detect = async () => {
      if (!isMountedRef.current) return;
      
      if (detectorRef.current && video && video.readyState === 4) {
        const poses = await detectorRef.current.estimatePoses(video);
        if (poses[0] && canvasRef.current && ctx) {
          drawPose(poses[0], ctx);
          checkExercise(poses[0]);
        }
      }
      
      if (isMountedRef.current) {
        animationFrameRef.current = requestAnimationFrame(detect);
      }
    };
    detect();
  }

  function drawPose(pose, ctx) {
    if (!canvasRef.current || !ctx) return;
    
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
      const result = exerciseFunctions[exercise].actionPose(pose);
      const isDetected = result.detected;
      
      // Initial pose → Action pose
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
      const result = exerciseFunctions[exercise].initialPose(pose);
      
      // Action pose → Initial pose
      if (result) {
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

  // Video container with overlay and counter overlay
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
        
        {/* Counter overlay */}
        <div style={{
          position: 'absolute',
          top: '30%',
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

        {/* Loading/Error overlay */}
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
