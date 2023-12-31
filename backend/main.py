import base64 as b64
import io
from contextlib import asynccontextmanager
from typing import Annotated, List

import cv2
import numpy as np
from fastapi import FastAPI, Form, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from ultralytics import YOLO

from config import get_settings
from database import close_orm, init_orm
from models import File, Post, Post_Pydantic
from utils import cat_annotate, encode_text, file_save

settings = get_settings()
models = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_orm(db_url=settings.DB_URL, modules={"models": ["models"]})

    models["yolov8"] = YOLO("yolo/yolov8s.pt")
    models["yolov5"] = YOLO("yolo/yolov5su.pt")

    yield
    await close_orm()


app = FastAPI(lifespan=lifespan, title="ICE4306")


@app.post("/posts/create")
async def post_craete(text: Annotated[str, Form()], file: UploadFile):
    file_db = await file_save(file)
    encoded_text = await encode_text(text, file)
    post = await Post.create(text=text, file=file_db, encoded_text=encoded_text)
    await post.fetch_related("file")

    return await Post_Pydantic.from_tortoise_orm(post)


@app.get("/posts")
async def post_list() -> List[Post_Pydantic]:
    posts = Post.all()
    posts.prefetch_related("file")

    return await Post_Pydantic.from_queryset(posts)


@app.get("/files/{file_id}")
async def file_download(file_id: int) -> FileResponse:
    file = await File.get(id=file_id)
    return FileResponse(file.path, filename=file.name, media_type=file.media_type)


@app.post("/cats/detect")
async def cat_detect(file: UploadFile, json: bool = False):
    file_bytes = np.asarray(bytearray(await file.read()), dtype=np.uint8)
    model = models["yolov5"]
    image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    annotated_image, detections = cat_annotate(model=model, image=image)

    result_bytes = cv2.imencode(".jpg", annotated_image)[1].tobytes()

    if json:
        return {
            "image": b64.b64encode(result_bytes).decode("utf8"),
            "count": len(detections),
        }
    else:
        result_image = io.BytesIO(result_bytes)
        return StreamingResponse(result_image, media_type="image/jpeg")
