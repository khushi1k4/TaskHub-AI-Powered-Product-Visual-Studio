from celery import Celery
from config import Config

celery = Celery(
    "taskhub",
    broker=Config.REDIS_URL,
    backend=Config.REDIS_URL,
    include=["tasks.notification_tasks"]
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=False,
    task_track_started=True
)