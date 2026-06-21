#!/usr/bin/env python3
"""
BuildSync-3D — blueprint to 3D model pipeline.

Reads an image, detects room polygons via grayscale + threshold + contour
detection + approxPolyDP, prints a JSON model to stdout:

    {"rooms": [{"id": "room-1", "polygon": [[x, y], ...], "height": 2.7}, ...]}

Usage:
    python3 blueprint_to_model.py <image_path> [--mock]

--mock skips OpenCV entirely and returns a hardcoded room. Useful for
running the API in environments without opencv-python installed.
"""
import json
import sys


def mock_model():
    return {
        "rooms": [
            {
                "id": "room-1",
                "name": "Living Room",
                "polygon": [[0, 0], [6, 0], [6, 4], [0, 4]],
                "height": 2.7,
            },
            {
                "id": "room-2",
                "name": "Kitchen",
                "polygon": [[6, 0], [10, 0], [10, 4], [6, 4]],
                "height": 2.7,
            },
        ]
    }


def detect(image_path: str):
    import cv2
    import numpy as np

    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise RuntimeError(f"Could not load image: {image_path}")

    _, thresh = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    # Close small gaps in wall lines
    kernel = np.ones((3, 3), np.uint8)
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)

    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    rooms = []
    h, w = img.shape
    scale = 10.0 / max(h, w)  # rough normalization to meters
    for idx, c in enumerate(contours):
        area = cv2.contourArea(c)
        if area < (h * w) * 0.005:  # ignore noise
            continue
        epsilon = 0.01 * cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, epsilon, True)
        polygon = [[round(float(p[0][0]) * scale, 3), round(float(p[0][1]) * scale, 3)] for p in approx]
        if len(polygon) < 3:
            continue
        rooms.append({
            "id": f"room-{idx + 1}",
            "name": f"Room {idx + 1}",
            "polygon": polygon,
            "height": 2.7,
        })

    return {"rooms": rooms}


def main():
    if len(sys.argv) < 2:
        print("usage: blueprint_to_model.py <image_path> [--mock]", file=sys.stderr)
        sys.exit(2)

    image_path = sys.argv[1]
    use_mock = "--mock" in sys.argv[2:]

    try:
        model = mock_model() if use_mock else detect(image_path)
    except Exception as e:
        print(f"pipeline error: {e}", file=sys.stderr)
        sys.exit(1)

    print(json.dumps(model))


if __name__ == "__main__":
    main()
