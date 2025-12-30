import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useEffect, useRef, useState } from "react";

const DetectVideoPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [annotatedVideo, setAnnotatedVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setAnnotatedVideo(null);
    }
  };

  const startCamera = async () => {
    try {
      let s: MediaStream | null = null;
      try {
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch (err) {
        s = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (!s) throw new Error("No stream");

      setStream(s);
      setCameraActive(true);
    } catch (err) {
      console.error("Camera start error", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setCameraActive(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (cameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("video/mp4")
      ? "video/mp4"
      : "video/webm";

    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const capturedFile = new File(
        [blob],
        `capture-${Date.now()}.${mimeType === "video/mp4" ? "mp4" : "webm"}`,
        {
          type: mimeType,
        }
      );
      setFile(capturedFile);
      stopCamera();
    };

    mediaRecorder.start();
    setIsRecording(true);

    recordingTimeoutRef.current = setTimeout(() => {
      stopRecording();
    }, 10000);
  };

  const stopRecording = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDetect = async () => {
    if (!file) return;

    setLoading(true);
    setAnnotatedVideo(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8000/detect-video", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setLoading(false);
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        setAnnotatedVideo(response.annotated_video);
      } else {
        console.error("Error detecting video");
      }
    };

    xhr.send(formData);
  };

  return (
    <>
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Detect Video</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="upload">
            <AccordionItem value="upload">
              <AccordionTrigger>Upload from system</AccordionTrigger>
              <AccordionContent>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="camera">
              <AccordionTrigger>Use system camera</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3">
                  {!cameraActive && (
                    <div className="flex gap-2">
                      <Button onClick={startCamera}>Open Camera</Button>
                    </div>
                  )}

                  {cameraActive && (
                    <div className="flex flex-col gap-2">
                      <video
                        ref={videoRef}
                        className="w-full h-64 rounded-md bg-black object-cover"
                        playsInline
                        autoPlay
                        muted
                      />
                      <div className="flex gap-2">
                        {!isRecording ? (
                          <Button onClick={startRecording}>
                            Start Recording
                          </Button>
                        ) : (
                          <Button variant="destructive" onClick={stopRecording}>
                            Stop Recording
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={stopCamera}
                          disabled={isRecording}
                        >
                          Close Camera
                        </Button>
                      </div>
                      {isRecording && (
                        <p className="text-sm text-red-500 animate-pulse">
                          Recording... (Auto-stops in 10s)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {file && previewUrl && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <video
                src={previewUrl}
                controls
                className="w-full h-64 rounded-md border bg-slate-50"
              />
            </div>
          )}

          <div className="flex justify-center gap-2 mt-4">
            <Button onClick={handleDetect} disabled={!file || loading}>
              Detect
            </Button>
            {file && (
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setAnnotatedVideo(null);
                }}
              >
                Clear
              </Button>
            )}
          </div>
          {loading && <Progress value={progress} className="mt-4" />}
        </CardContent>
      </Card>
      {annotatedVideo && (
        <Card className="max-w-xl mx-auto mt-4">
          <CardHeader>
            <CardTitle>Detected Video (GIF)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <img
                src={annotatedVideo}
                alt="Annotated Video"
                className="max-w-full h-auto rounded-md"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default DetectVideoPage;
