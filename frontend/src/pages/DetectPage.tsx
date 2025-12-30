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

const DetectPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
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

  const handleCapture = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const capturedFile = new File([blob], `capture-${Date.now()}.png`, {
            type: blob.type,
          });
          setFile(capturedFile);
        }
        stopCamera();
        resolve();
      }, "image/png");
    });
  };

  const handleDetect = async () => {
    if (!file) return;

    setLoading(true);
    setAnnotatedImage(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8000/detect", true);

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
        setAnnotatedImage(response.annotated_image);
      } else {
        console.error("Error detecting image");
      }
    };

    xhr.send(formData);
  };

  return (
    <>
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Detect Image</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="upload">
            <AccordionItem value="upload">
              <AccordionTrigger>Upload from system</AccordionTrigger>
              <AccordionContent>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="camera">
              <AccordionTrigger>Use system camera</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3">
                  {!cameraActive && (
                    <>
                      <div className="flex gap-2">
                        <Button onClick={startCamera}>Open Camera</Button>
                      </div>
                    </>
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
                        <Button onClick={handleCapture}>Capture</Button>
                        <Button variant="outline" onClick={stopCamera}>
                          Close Camera
                        </Button>
                      </div>
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {file && previewUrl && (
            <img
              src={previewUrl}
              alt="Captured"
              className="w-full h-64 object-contain rounded-md border bg-slate-50"
            />
          )}

          <div className="flex justify-center gap-2 mt-4">
            <Button onClick={handleDetect} disabled={!file || loading}>
              Detect
            </Button>
            {file && (
              <Button variant="outline" onClick={() => setFile(null)}>
                Clear
              </Button>
            )}
          </div>
          {loading && <Progress value={progress} className="mt-4" />}
        </CardContent>
      </Card>
      {annotatedImage && (
        <Card className="max-w-xl mx-auto mt-4">
          <CardHeader>
            <CardTitle>Detected Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <img
                src={annotatedImage}
                alt="Annotated"
                className="max-w-full h-auto"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default DetectPage;
