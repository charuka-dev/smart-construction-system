"""Wall detection: grayscale -> Otsu threshold -> morphological close."""
import numpy as np


def detect_walls(image_path: str):
    """Returns (closed_mask, (h, w)) for downstream room detection."""
    import cv2

    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise RuntimeError(f"Could not load image: {image_path}")

    _, thresh = cv2.threshold(
        img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )
    kernel = np.ones((3, 3), np.uint8)
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)
    return closed, img.shape
