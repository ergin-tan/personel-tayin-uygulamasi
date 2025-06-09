FROM node:24-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend/ ./backend/

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/

RUN npm install -g concurrently

EXPOSE 3000 3001

CMD ["concurrently", "\"cd backend && node index.js\"", "\"cd frontend && npm start\""]