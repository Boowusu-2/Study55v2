# SmartStudy Text Extraction API

A FastAPI backend service for extracting text from various document formats including PDF, DOCX, DOC, PPTX, and TXT files.

## Features

- Extract text from multiple file formats
- RESTful API with automatic documentation
- CORS support for frontend integration
- File validation and error handling
- Docker support for easy deployment

## Supported File Types

- PDF (.pdf)
- Microsoft Word (.docx, .doc)
- Microsoft PowerPoint (.pptx, .ppt)
- Plain Text (.txt)

## Quick Start

### Using Docker (Recommended)

1. Build and run with Docker Compose:

```bash
docker-compose up --build
```

2. Or build and run with Docker:

```bash
docker build -t smartstudy-api .
docker run -p 8000:8000 smartstudy-api
```

### Local Development

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the server:

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check

- `GET /health` - Check if the service is running

### Text Extraction

- `POST /extract-text` - Extract text from uploaded files

### API Documentation

- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation

## Usage Example

```bash
# Upload files for text extraction
curl -X POST "http://localhost:8000/extract-text" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "files=@document.pdf" \
  -F "files=@presentation.pptx"
```

## Environment Variables

- `PYTHONUNBUFFERED=1` - Ensures Python output is not buffered (useful for Docker)

## Deployment

### Production Considerations

1. **CORS Configuration**: Update the CORS settings in `main.py` to only allow your frontend domain
2. **Environment Variables**: Use environment variables for configuration
3. **Reverse Proxy**: Use nginx or similar for production deployment
4. **SSL/TLS**: Configure HTTPS for production use

### Example Production Docker Compose

```yaml
version: "3.8"

services:
  smartstudy-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure all dependencies are installed
2. **File Permission Errors**: Check file permissions in Docker volumes
3. **Memory Issues**: Large files may require more memory allocation

### Logs

Check the logs directory for detailed error information:

```bash
docker-compose logs smartstudy-api
```

## Development

### Adding New File Types

1. Add the extraction function in `extract_text.py`
2. Update the file type validation in `main.py`
3. Add any new dependencies to `requirements.txt`

### Testing

Test the API using the interactive documentation at `http://localhost:8000/docs`
