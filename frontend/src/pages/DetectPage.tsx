
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const DetectPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
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
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Detect Image</CardTitle>
      </CardHeader>
      <CardContent>
        <Input type="file" onChange={handleFileChange} />
        <Button onClick={handleDetect} disabled={!file || loading} className="mt-4">
          Detect
        </Button>
        {loading && <Progress value={progress} className="mt-4" />}
        {annotatedImage && (
          <div className="mt-4">
            <img src={annotatedImage} alt="Annotated" className="max-w-full h-auto" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DetectPage;
