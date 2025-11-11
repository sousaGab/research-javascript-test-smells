FROM node:20-slim

# Install git
RUN  apt-get update -qq && \
apt-get install git  -y

# Set work directorie
WORKDIR /app
# Copy package.json
COPY  package.json yarn.lock ./
# Install deps
RUN yarn
# Copy folders
COPY . .

# Declaring env
ENV NODE_ENV development
ENV HOST=0.0.0.0 PORT=3001

# Expose port
EXPOSE 3001


# Starting our application
CMD [ "yarn", "run", "start"]
