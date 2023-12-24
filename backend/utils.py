import uuid

import supervision as sv
from cv2.typing import MatLike
from fastapi import UploadFile

from models import File


async def file_save(file: UploadFile) -> File:
    await file.seek(0)
    contents = await file.read()
    path = f"data/files/{str(uuid.uuid4())}"
    media_type = file.content_type
    with open(path, "wb") as f:
        f.write(contents)
    return await File.create(name=file.filename, path=path, media_type=media_type)


async def encode_text(text: str, file: UploadFile) -> str:
    await file.seek(0)
    contents = await file.read()
    text_bytes = text.encode()
    contents_bytes = contents[0xF0 : 0xF0 + len(text_bytes)]
    contents_bytes += b"\x00" * (len(text_bytes) - len(contents_bytes))
    xor_results = bytes([a ^ b for a, b in zip(text_bytes, contents_bytes)])
    return xor_results.hex()


def cat_annotate(model, image: MatLike) -> MatLike:
    # RUN Yolo Model
    results = model(image)[0]

    # Filter detections to only cats
    detections = sv.Detections.from_ultralytics(results)
    detections = detections[detections.class_id == 15]  # 15 is cat class id
    labels = [
        f"{results.names[class_id]} {confidence:.2f}"
        for class_id, confidence in zip(detections.class_id, detections.confidence)
    ]

    # Annotate image
    bounding_box_annotator = sv.BoundingBoxAnnotator()
    label_annotator = sv.LabelAnnotator()
    annotated_image = bounding_box_annotator.annotate(
        scene=image, detections=detections
    )
    annotated_image = label_annotator.annotate(
        scene=annotated_image, detections=detections, labels=labels
    )

    return annotated_image, detections
