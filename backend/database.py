from tortoise import Tortoise, connections
from tortoise.log import logger


async def init_orm(db_url, modules) -> None:
    await Tortoise.init(db_url=db_url, modules=modules)
    logger.info(
        "Tortoise-ORM started, %s, %s", connections._get_storage(), Tortoise.apps
    )
    logger.info("Tortoise-ORM generating schema")
    await Tortoise.generate_schemas()


async def close_orm() -> None:
    await connections.close_all()
    logger.info("Tortoise-ORM shutdown")
