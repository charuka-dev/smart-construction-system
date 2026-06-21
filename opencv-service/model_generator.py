"""Assemble the final 3D model JSON consumed by the Node.js backend."""
from wall_detection import detect_walls
from room_detection import detect_rooms

DEFAULT_WALL_HEIGHT = 2.7  # meters


def mock_model():
    return {
        "rooms": [
            {"id": "room-1", "name": "Living Room",
             "polygon": [[0, 0], [6, 0], [6, 4], [0, 4]],
             "height": DEFAULT_WALL_HEIGHT},
            {"id": "room-2", "name": "Kitchen",
             "polygon": [[6, 0], [10, 0], [10, 4], [6, 4]],
             "height": DEFAULT_WALL_HEIGHT},
        ],
        "walls": [],
    }


def build_model(image_path: str):
    closed, shape = detect_walls(image_path)
    rooms = detect_rooms(closed, shape)
    for r in rooms:
        r["height"] = DEFAULT_WALL_HEIGHT
    return {"rooms": rooms, "walls": []}
