FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["sh", "-c", "redis-server --daemonize yes && celery -A workers.celery_app worker --loglevel=info & exec gunicorn 'app:create_app()' --bind 0.0.0.0:$PORT"]