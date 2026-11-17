# Lightweight Node.js 20 image
FROM node:24-alpine

# Container ke andar application directory
WORKDIR /app

# Pehle package files copy karenge
# Isse Docker dependency layer ko cache kar sakta hai
COPY package*.json ./

# package-lock.json ke exact dependencies install karega
RUN npm ci

# Ab complete React projec copy karo
COPY . .

# Vite ko port 3000 par run karne ke liye
EXPOSE 3000

# React/Vite development server start karega
# --host 0.0.0.0 important hai because Docker ke bahar
# browser/EC2 se application access karni hai
# --port 3000 ensure karta hai ki wahi port use ho jo expose kiya hai
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]