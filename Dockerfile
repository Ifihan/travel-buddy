# Use the official Python image from the Docker Hub
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY . /app

# Install necessary dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Expose the port that the application will run on
EXPOSE 8080

# Run the application with gunicorn for production readiness
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8080"]