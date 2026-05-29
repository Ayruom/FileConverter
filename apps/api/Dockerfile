FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    libreoffice-headless \
    libmagic1 \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libheif1 \
    ghostscript \
    pandoc \
    fonts-liberation \
    fonts-noto \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 fileflux
WORKDIR /app
RUN chown fileflux:fileflux /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=fileflux:fileflux . .
USER fileflux

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
