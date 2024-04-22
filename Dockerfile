# FROM node:bullseye-slim
FROM nvidia/cuda:12.4.1-runtime-ubuntu22.04
RUN apt update
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/La_Paz
ENV DEB_CONFIGURE_TZDATA=America/La_Paz
#Nvidia Config
ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES compute,utility
#components for whatsapp-web.js(support no-gui systems)
RUN apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
RUN apt install -y chromium-browser curl
#node
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt install -y nodejs
# For transcription
RUN apt install -y ffmpeg
## It will install latest model of OpenAI Whisper (around 6~7 GB)
## Uncomment below command if you want to use the local version of transcription module
RUN apt install -y python-is-python3 pip
#RUN pip install -y python pip
#Actualizar pip para poder usar el cache purge
RUN pip3 install --upgrade pip
RUN pip install -U openai-whisper
RUN pip3 uninstall -y torch
RUN pip3 cache purge
RUN pip install -U cuda-python
RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
WORKDIR /app/
ENV OPENAI_API_KEY ""
ENV PREFIX_ENABLED ""
COPY package.json package-lock.json ./
RUN npm install
RUN npm install vite-node@0.31.1
COPY . .
CMD ["npm", "run", "start"]
