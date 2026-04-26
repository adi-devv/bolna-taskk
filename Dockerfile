FROM node:20-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN cp -r .next/static .next/standalone/.next/static && \
    mkdir -p /app/data

EXPOSE 7860

ENV PORT=7860
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production

CMD ["node", ".next/standalone/server.js"]
