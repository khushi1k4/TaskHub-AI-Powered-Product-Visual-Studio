FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

# System dependencies for OpenCV, rembg, ONNX, etc.
RUN apt-get update && apt-get install -y \
    redis-server \
    build-essential \
    gcc \
    g++ \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libxcb1 \
    libx11-6 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 10000

CMD ["sh", "-c", "redis-server --daemonize yes && celery -A workers.celery_app worker --loglevel=info & exec gunicorn 'app:create_app()' --bind 0.0.0.0:$PORT"]