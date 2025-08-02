#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export HUGGING_FACE_API_KEY="********"

# Run the application
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
