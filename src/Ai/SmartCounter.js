import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

import useHttp from '../hooks/http.hook';

import exerciseFunctions from './poses/pose';
import { programToExercise, drawPose } from './utils';

import './SmartCounter.css';

import BreakModal from './components/BreakModal';
import StatusOverlay from './components/StatusOverlay';
import Counters from './components/Counters';

export default function SmartCounter({ handleClose, setRecords }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  const { request } = useHttp();

  const [status, setStatus] = useState("Loading model...");

  const [programs, setPrograms] = useState([]);
  const [exercise, setExercise] = useState();

  const [exerciseReady, setExerciseReady] = useState(false);

  const [time, setTime] = useState();
  const [timeLimit, setTimeLimit] = useState();
  const [isBreak, setIsBreak] = useState(false);

  const myPoseRef = useRef(true);
  const stableFramesRef = useRef(0);
  const breakStartedRef = useRef(false);
  const breakCompletedRef = useRef(false);
  const currentMaxScoreRef = useRef(0);
  const totalScoreRef = useRef(0);

  const resetScoreTracking = () => {
    currentMaxScoreRef.current = 0;
    totalScoreRef.current = 0;
  };

  const setCount = (countOrFn) => {
    setExercise((prev) => {
      if (!prev) return prev;

      const currentCount = prev.count ?? 0;
      const nextCount =
        typeof countOrFn === 'function'
          ? countOrFn(currentCount)
          : countOrFn ?? 0;

      let newTotalScore = prev.totalScore ?? 0;
      let averageScore = prev.averageScore ?? 0;
      let newCurrentMaxScore = prev.currentMaxScore ?? 0;

      if (nextCount > currentCount) {
        newTotalScore += currentMaxScoreRef.current;
        totalScoreRef.current = newTotalScore;
        averageScore = nextCount > 0 ? newTotalScore / nextCount : 0;
        currentMaxScoreRef.current = 0;
        newCurrentMaxScore = 0;
      }

      return {
        ...prev,
        count: nextCount,
        totalScore: newTotalScore,
        averageScore,
        currentMaxScore: newCurrentMaxScore,
      };
    });
  };

  useEffect(() => {
    const fetchPrograms = async () => {
      const data = await request('/app/programs', 'GET');
      const firstProgram = data.find(program => program.order_num === 1);
      if (firstProgram) {
        const newExercise = programToExercise(firstProgram);
        newExercise.sets = 1;
        resetScoreTracking();
        setExercise(newExercise);
        setExerciseReady(true);
      } else {
        handleClose();
      }
      setPrograms(data);
    }
    fetchPrograms();
  }, [request]);

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
      setTime(exercise.duration);
      setTimeLimit(exercise.durationLimit);
      runDetection();
    }

    if (exerciseReady) init();

    return () => {
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
  }, [exerciseReady]);

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

  function checkExercise(pose) {
    if (!exercise || !exerciseFunctions[exercise.id]) return;
    const stableFrames = stableFramesRef.current;
    const currentPose = myPoseRef.current;

    if (currentPose) {
      const result = exerciseFunctions[exercise.id].actionPose(pose);
      if (result) {
        const score = Number.isFinite(result.score) ? Math.round(result.score) : 0;
        if (score > currentMaxScoreRef.current) {
          currentMaxScoreRef.current = score;
          setExercise((prev) =>
            prev
              ? {
                  ...prev,
                  currentMaxScore: score,
                }
              : prev
          );
        }
      }
      
      const isDetected = result?.detected;
      
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
      const result = exerciseFunctions[exercise.id].initialPose(pose);
      
      if (result) {
        stableFramesRef.current++;
        if (stableFrames > 3) {
          myPoseRef.current = true;
          stableFramesRef.current = 0;
          if (!isBreak) setCount((prevCount) => prevCount + 1);
        }
      } else {
        stableFramesRef.current = 0;
      }
    }
  }

  useEffect(() => {
    if (!isBreak) {
      breakStartedRef.current = false;
    }
    
    if (!isBreak && exerciseReady && exercise && !breakStartedRef.current) {
      if (exercise.programTypeId === 1 && exercise.count >= exercise.countLimit) {
        breakStartedRef.current = true;
        setExercise((prev) => ({ ...prev, duration: time }));
        setTime(0);
        setTimeLimit(exercise.breakTime);
        setIsBreak(true);
      } else if (exercise.programTypeId === 2 && timeLimit && time >= timeLimit) {
        breakStartedRef.current = true;
        setExercise((prev) => ({ ...prev, duration: time }));
        setTime(0);
        setTimeLimit(exercise.breakTime);
        setIsBreak(true);
      }
    }
  }, [isBreak, exerciseReady, exercise, time, timeLimit]);

  useEffect(() => {
    if (isBreak) {
      breakCompletedRef.current = false;
    }
    
    if (isBreak && exerciseReady && exercise && timeLimit && time >= timeLimit && !breakCompletedRef.current) {
      breakCompletedRef.current = true;
      setIsBreak(false);
      
      const currentExercise = exercise;
      
      if (currentExercise.sets < currentExercise.setsLimit) {
        setRecords((prevRecords) => [
          ...prevRecords,
          {
            ...currentExercise,
            type: 'set',
            setNumber: currentExercise.sets,
            totalScore:
              typeof currentExercise.totalScore === 'number'
                ? currentExercise.totalScore
                : totalScoreRef.current,
            averageScore:
              typeof currentExercise.averageScore === 'number'
                ? currentExercise.averageScore
                : currentExercise.count > 0
                ? (typeof totalScoreRef.current === 'number'
                    ? totalScoreRef.current
                    : 0) / currentExercise.count
                : 0,
            timestamp: Date.now(),
          },
        ]);
        resetScoreTracking();
        setExercise({
          ...currentExercise,
          sets: currentExercise.sets + 1,
          count: 0,
          duration: 0,
          currentMaxScore: 0,
          totalScore: 0,
          averageScore: 0,
        });
        setTime(0);
        setTimeLimit(currentExercise.durationLimit);
      } else {
        setRecords((prevRecords) => [
          ...prevRecords,
          {
            ...currentExercise,
            type: 'exercise',
            setNumber: currentExercise.sets,
            totalScore:
              typeof currentExercise.totalScore === 'number'
                ? currentExercise.totalScore
                : totalScoreRef.current,
            averageScore:
              typeof currentExercise.averageScore === 'number'
                ? currentExercise.averageScore
                : currentExercise.count > 0
                ? (typeof totalScoreRef.current === 'number'
                    ? totalScoreRef.current
                    : 0) / currentExercise.count
                : 0,
            timestamp: Date.now(),
          },
        ]);
        
        const newOrderNum = currentExercise.orderNum + 1;
        const nextProgram = programs.find(program => program.order_num === newOrderNum);
        if (nextProgram) {
          const newExercise = programToExercise(nextProgram);
          newExercise.sets = 1;
          resetScoreTracking();
          setExercise(newExercise);
          setTime(0);
          setTimeLimit(newExercise.durationLimit);
        } else {
          handleClose();
        }
      }
    }
  }, [isBreak, exerciseReady, exercise, timeLimit, time, programs, setRecords, handleClose]);

  return (
      <div className="smart-counter-container">
        <video
          ref={videoRef}
          className="smart-counter-video"
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="smart-counter-canvas"
        />
        
        {!isBreak && (
          <>
            <Counters count={exercise?.count} time={time} timeLimit={timeLimit} setTime={setTime} />
            {exercise?.name && (
              <div className="smart-counter-exercise-name-text">
                {exercise.name}
              </div>
            )}
          </>
        )}

        {isBreak && (
          <BreakModal time={time} setTime={setTime} timeLimit={timeLimit} />
        )}

        {(status === "Loading model..." || status.includes("Error")) && (
          <StatusOverlay status={status} />
        )}
      </div>
  );
}