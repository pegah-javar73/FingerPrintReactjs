import React, { useEffect, useRef, useState } from "react";

const WebcamRecorder: React.FC = () => {
  const [webcams, setWebcams] = useState<MediaDeviceInfo[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);

  // Get list of available webcams
  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setWebcams(videoDevices);
      })
      .catch((err) => console.error("Error accessing devices: ", err));
  }, []);

  // Start video stream from selected webcam
  const handleStartStream = async (deviceId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId },
      });
      // نمایش مستقیم استریم روی ویدیو
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setVideoStream(stream);
    } catch (err) {
      console.error("Error starting stream: ", err);
    }
  };

  // Start recording the stream
  const handleStartRecording = () => {
    if (videoStream) {
      // پاک کردن داده‌های قبلی قبل از شروع ضبط جدید
      recordedChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(videoStream, {
        mimeType: "video/webm", // تنظیم نوع ویدیو
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // ایجاد Blob از داده‌های ضبط‌شده
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url); // ذخیره آدرس Blob برای نمایش ویدیو
        sendVideoToBackend(blob); // ارسال به بک‌اند
      };

      mediaRecorder.start(); // شروع ضبط
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
    }
  };

  // Stop recording and save video
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop(); // توقف ضبط
      setRecording(false);
    }
  };

  // Capture photo from current stream
  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const photoUrl = canvas.toDataURL("image/png");

        // تبدیل عکس به Blob برای ارسال به بک‌اند
        canvas.toBlob((blob) => {
          if (blob) {
            sendPhotoToBackend(blob);
          }
        }, "image/png");

        // نمایش عکس گرفته‌شده
        setPhotoUrl(photoUrl);
      }
    }
  };

  // Stop video stream
  const handleStopStream = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }

    // پاک کردن استریم از videoRef
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Send video to backend after recording
  const sendVideoToBackend = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("file", blob, "recorded_video.webm");

    try {
      console.log("Video captured and ready to send:", formData);
      // ارسال ویدیو به بک‌اند
    } catch (error) {
      console.error("Error uploading video: ", error);
    }
  };

  // Send photo to backend after capturing
  const sendPhotoToBackend = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("file", blob, "captured_image.png");

    try {
      console.log("Photo captured and ready to send:", formData);
      // ارسال عکس به بک‌اند
    } catch (error) {
      console.error("Error uploading photo: ", error);
    }
  };
  useEffect(() => {
    if (videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);
  
  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-2">Webcam Recorder</h1>

      {/* Webcams List */}
      <ul className="mb-4">
        {webcams.map((webcam, index) => (
          <li key={index}>
            {webcam.label || `Webcam ${index + 1}`}
            <button
              onClick={() => handleStartStream(webcam.deviceId)}
              className="ml-2 p-1 bg-blue-500 text-white rounded"
            >
              Start
            </button>
          </li>
        ))}
      </ul>

      {/* Video Preview */}
      {videoStream && (
        <div className="mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-96 border rounded"
          />
        </div>
      )}

      {/* Recording Controls */}
      {videoStream && (
        <div className="mb-4">
          {!recording ? (
            <button
              onClick={handleStartRecording}
              className="p-2 bg-green-500 text-white rounded mr-2"
            >
              Start Recording
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="p-2 bg-red-500 text-white rounded mr-2"
            >
              Stop Recording
            </button>
          )}

          <button
            onClick={handleCapturePhoto}
            className="p-2 bg-yellow-500 text-white rounded mr-2"
          >
            Capture Photo
          </button>

          <button
            onClick={handleStopStream}
            className="p-2 bg-gray-500 text-white rounded"
          >
            Stop Stream
          </button>
        </div>
      )}

      {/* Video Playback */}
      {videoUrl && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Recorded Video:</h2>
          <video
            ref={playbackRef}
            src={videoUrl}
            controls
            className="w-96 border rounded mt-2"
          />
          <a
            href={videoUrl}
            download="recorded_video.webm"
            className="block mt-2 p-2 bg-blue-500 text-white text-center rounded"
          >
            Download Video
          </a>
        </div>
      )}

      {/* Captured Photo */}
      {photoUrl && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Captured Photo:</h2>
          <img
            src={photoUrl}
            alt="Captured"
            className="w-96 border rounded mt-2"
          />
          <a
            href={photoUrl}
            download="captured_image.png"
            className="block mt-2 p-2 bg-blue-500 text-white text-center rounded"
          >
            Download Photo
          </a>
        </div>
      )}
    </div>
  );
};

export default WebcamRecorder;
