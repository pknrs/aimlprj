import base64
import io
import os
import tempfile

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image as PILImage
from ultralytics import YOLO

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the YOLOv8 model
model = YOLO("yolov8n.pt")


@app.post("/detect-image")
async def detect(file: UploadFile = File(...)):
    # Read the image file
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Perform detection
    results = model(img)

    # Draw boxes and labels
    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = box.conf[0]
            cls = int(box.cls[0])
            cls_name = model.names[cls]
            label = f"{cls_name} {conf:.2f}"
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 3)
            cv2.putText(
                img, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2
            )

    # Convert the final image to a Base64 string
    _, buffer = cv2.imencode(".jpg", img)
    img_base64 = base64.b64encode(buffer).decode("utf-8")

    return {"annotated_image": f"data:image/jpeg;base64,{img_base64}"}


@app.post("/detect-video")
async def detect_video(file: UploadFile = File(...)):
    # Save the uploaded video to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_file:
        tmp_file.write(await file.read())
        tmp_path = tmp_file.name

    try:
        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open video file")

        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
        duration = frame_count / fps if fps > 0 else 0

        if duration > 10:
            raise HTTPException(
                status_code=400, detail="Video duration exceeds 10 seconds"
            )

        frames = []
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Perform detection
            results = model(frame)

            # Draw boxes and labels
            for result in results:
                for box in result.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = box.conf[0]
                    cls = int(box.cls[0])
                    cls_name = model.names[cls]
                    label = f"{cls_name} {conf:.2f}"
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 3)
                    cv2.putText(
                        frame,
                        label,
                        (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.9,
                        (0, 255, 0),
                        2,
                    )

            # Convert to RGB for GIF
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = PILImage.fromarray(rgb_frame)
            frames.append(pil_image)

        cap.release()

        if not frames:
            raise HTTPException(status_code=400, detail="No frames processed")

        buffer = io.BytesIO()
        duration_per_frame = 1000 / fps if fps > 0 else 100
        frames[0].save(
            buffer,
            format="GIF",
            save_all=True,
            append_images=frames[1:],
            duration=duration_per_frame,
            loop=0,
        )
        gif_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        return {"annotated_video": f"data:image/gif;base64,{gif_base64}"}

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.get("/")
def read_root():
    return {"message": "API Running"}
