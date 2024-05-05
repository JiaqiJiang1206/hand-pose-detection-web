
import {
  HandLandmarker,
  FilesetResolver,
  PoseLandmarker
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let handLandmarker = undefined;
let poseLandmarker = undefined;
const createHandPoseLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm");
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
    delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
      delegate: "GPU"
    },
    runningMode: runningMode,
    numPoses: 2
  });
};

createHandPoseLandmarker();

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
let webcamRunning = false;
let enableWebcamButton = undefined;
let runningMode = "VIDEO";

// Check if webcam access is supported.
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

// Enable the live webcam view and start detection.
function enableCam(event) {
  if (!handLandmarker) {
    console.log("Wait! handLandmarker not loaded yet.");
    return;
  }

  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "ENABLE PREDICTIONS";
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "DISABLE PREDICTIONS";
  }

  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

let lastVideoTime = -1;

async function predictWebcam() {
  if (video.currentTime === lastVideoTime || !webcamRunning) {
    // 如果视频时间没有变或摄像头未开启，跳过当前帧的处理
    requestAnimationFrame(predictWebcam);
    return;
  }

  lastVideoTime = video.currentTime;

  let startTimeMs = performance.now();
  try {
    let [handResults, poseResults] = await Promise.all([
      handLandmarker.detectForVideo(video, startTimeMs),
      poseLandmarker.detectForVideo(video, startTimeMs)
    ]);

    // 清除画布和绘制检测结果
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    // 在这里处理和绘制手部和姿势的结果
    if (poseResults && handResults) {
          for (const landmarks of poseResults.landmarks) {
            drawConnectors(canvasCtx, landmarks, POSE_CONNECTIONS, {
              color: "#00FF00",
              lineWidth: 1
            });
            drawLandmarks(canvasCtx, landmarks, { 
              color: "#FF0000", 
              lineWidth: 1,
              fillColor: "rgba(255, 0, 0, 0.5)",   // 假设添加填充色
              radius: 2,                         // 假设每个地标的绘制半径为5
              visibilityMin: 0.5                 // 假设只绘制可见度大于0.5的地标
            });
          }
          for (const landmarks of handResults.landmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
              color: "#00FF00",
              lineWidth: 1
            });
            // drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 0.1});
            drawLandmarks(canvasCtx, landmarks, { 
              color: "#FF0000", 
              lineWidth: 1,
              fillColor: "rgba(255, 0, 0, 0.5)",   // 假设添加填充色
              radius: 2,                         // 假设每个地标的绘制半径为5
              visibilityMin: 0.5                 // 假设只绘制可见度大于0.5的地标
            });
          }
    }

  } catch (error) {
    console.error(error);
  }

  // 继续请求下一帧处理
  requestAnimationFrame(predictWebcam);
}

