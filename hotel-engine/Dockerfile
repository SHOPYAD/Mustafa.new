FROM mcr.microsoft.com/playwright:v1.52.0-noble AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM mcr.microsoft.com/playwright:v1.52.0-noble
WORKDIR /app
ENV NODE_ENV=production
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund
COPY --from=build /app/dist ./dist
COPY src/catalog/data ./dist/catalog/data
COPY src/catalog/data ./src/catalog/data
RUN mkdir -p /app/storage
EXPOSE 3051
CMD ["node", "dist/main.js"]
