"""Room detection: contour extraction + polygon approximation."""


def detect_rooms(closed_mask, shape):
    """Given a closed wall mask and original (h, w), return room polygons in
    meters (rough normalization with the longest side mapped to 10m)."""
    import cv2

    h, w = shape
    contours, _ = cv2.findContours(
        closed_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    rooms = []
    scale = 10.0 / max(h, w)
    min_area = (h * w) * 0.005

    for idx, c in enumerate(contours):
        if cv2.contourArea(c) < min_area:
            continue
        epsilon = 0.01 * cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, epsilon, True)
        polygon = [
            [round(float(p[0][0]) * scale, 3),
             round(float(p[0][1]) * scale, 3)]
            for p in approx
        ]
        if len(polygon) < 3:
            continue
        rooms.append({
            "id": f"room-{idx + 1}",
            "name": f"Room {idx + 1}",
            "polygon": polygon,
        })
    return rooms
