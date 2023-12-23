from tortoise import Tortoise, fields
from tortoise.contrib.pydantic import pydantic_model_creator
from tortoise.models import Model

from config import get_settings

settings = get_settings()


class Post(Model):
    id = fields.IntField(pk=True)
    text = fields.TextField()
    file = fields.OneToOneField("models.File")

    def __str__(self):
        return self.text


class File(Model):
    id = fields.IntField(pk=True)
    path = fields.TextField()
    name = fields.TextField()
    media_type = fields.TextField()

    def url(self) -> str:
        return f"{settings.APP_URL}/files/{self.id}"

    def __str__(self):
        return self.name

    class PydanticMeta:
        computed = ["url"]
        exclude = ["path"]


Tortoise.init_models(["models"], "models")
Post_Pydantic = pydantic_model_creator(Post, name="Post")
