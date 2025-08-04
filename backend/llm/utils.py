import logging
from PIL import Image
import io
from fastapi import HTTPException, UploadFile
from google.genai.types import Part, Blob

# Configure logging
logger = logging.getLogger(__name__)


def process_image(image_file: UploadFile) -> Part:
    """Process an uploaded image file and return a Part for ADK"""

    if not image_file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, detail=f"Invalid file type: {image_file.content_type}"
        )

    try:
        # Read and process the image
        image_data = image_file.file.read()
        image = Image.open(io.BytesIO(image_data))
        # Convert to RGB if necessary
        if image.mode != "RGB":
            image = image.convert("RGB")

        # Resize if too large (Gemini has size limits)
        max_size = 1024
        if max(image.size) > max_size:
            ratio = max_size / max(image.size)
            new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
            image = image.resize(new_size, Image.Resampling.LANCZOS)

        # Save the processed image back to bytes
        processed_image_bytes = io.BytesIO()
        image.save(processed_image_bytes, format="JPEG")
        processed_image_bytes.seek(0)
        image_part = Part.from_bytes(data=processed_image_bytes.getvalue(), mime_type="image/jpeg")
        return image_part

    except Exception as e:
        logger.error(f"[ERROR] Error processing image: {str(e)}")
        raise HTTPException(
            status_code=400, detail=f"Image processing failed: {str(e)}"
        )
