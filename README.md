
## 资源

- **[MediaPipe](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)**: Google 开发的用于构建管道来处理多媒体内容的框架，特别适合处理视频流中的手势和体态追踪。

## 网页结构概览

### head 部分

首先，在HTML的`<head>`部分，需要引入必要的CSS和JavaScript库：

```html
<!-- CSS 文件 -->
  <link href="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css" rel="stylesheet">
  <script src="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js"></script>
  <!-- 绘图工具 -->
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
  <!-- 手部检测模型 -->
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
  <!-- 姿势检测模型 -->
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js" crossorigin="anonymous"></script>
```

### body 部分

主要由以下几个部分组成：

- 一个按钮，用来激活和关闭摄像头。
- 视频元素，实时显示用户的摄像头视频流。
- 画布（Canvas），用来在视频流上绘制检测到的手势和体态的关键点和连接线。

```html

<button id="webcamButton" class="mdc-button mdc-button--raised">ENABLE WEBCAM</button>
<video id="webcam" autoplay style="transform: scale(-1, 1);"></video>
<canvas id="output_canvas" style="position: absolute; left: 0px; top: 0px; transform: scaleX(-1);"></canvas>
```

## JS 部分
### 启动摄像头并处理视频流

我们监听按钮的点击事件来启动或关闭摄像头。使用`navigator.mediaDevices.getUserMedia` API 来获取视频流，并将其设置为`video`元素的来源。

```javascript
const constraints = {
  video: { width: { ideal: 1280 }, height: { ideal: 720 } }
};

navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
  video.srcObject = stream;
  video.addEventListener('loadeddata', predictWebcam);
});

function enableCam(event) {
  // 切换 webcam 的激活状态
}
```

### 利用 MediaPipe 追踪关键点

使用MediaPipe库中的`HandLandmarker`和`PoseLandmarker`来识别视频中的手势和体态的关键点。创建一个Vision Tasks文件解析器来设定模型路径并进行初始化。然后，当视频数据加载后，周期性地调用`predictWebcam`函数。

```javascript
let handLandmarker = await HandLandmarker.createFromOptions(...);
let poseLandmarker = await PoseLandmarker.createFromOptions(...);

async function predictWebcam() {
  let [handResults, poseResults] = await Promise.all([
    handLandmarker.detectForVideo(video),
    poseLandmarker.detectForVideo(video)
  ]);
  drawResults(handResults, poseResults);
}
```

### 绘制关键点和连接线

使用`drawing_utils`中的`drawConnectors`和`drawLandmarks`函数来绘制关键点和它们之间的连接线。

```javascript
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
		drawLandmarks(canvasCtx, landmarks, { 
		  color: "#FF0000", 
		  lineWidth: 1,
		  fillColor: "rgba(255, 0, 0, 0.5)",   // 假设添加填充色
		  radius: 2,                         // 假设每个地标的绘制半径为5
		  visibilityMin: 0.5                 // 假设只绘制可见度大于0.5的地标
		});
	  }
```


## References

- [Mediapipe入门——搭建姿态检测模型并实时输出人体关节点3d坐标（2024.1.4更新）\_mediapipe模型-CSDN博客](https://blog.csdn.net/kalakalabala/article/details/121530651)
- [Hand landmarks detection guide  |  MediaPipe  |  Google for Developers](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
