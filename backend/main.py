import uuid
from typing import Annotated, List

from fastapi import FastAPI, Form, UploadFile
from fastapi.responses import FileResponse
from tortoise.contrib.fastapi import register_tortoise

from config import get_settings
from models import File, Post, Post_Pydantic

app = FastAPI()
settings = get_settings()


@app.post("/posts/create")
async def post_craete(text: Annotated[str, Form()], file: UploadFile):
    file_db = await file_save(file)
    post = await Post.create(text=text, file=file_db)
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


async def file_save(file: UploadFile) -> File:
    contents = await file.read()
    path = f"data/files/{str(uuid.uuid4())}"
    media_type = file.content_type
    with open(path, "wb") as f:
        f.write(contents)
    return await File.create(name=file.filename, path=path, media_type=media_type)


register_tortoise(
    app,
    db_url=settings.DB_URL,
    modules={"models": ["models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)
