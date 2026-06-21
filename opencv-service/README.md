# OpenCV Blueprint Service

One-shot Python script the Node.js backend invokes as a subprocess when a
blueprint is uploaded. Not a long-running service — no HTTP, no queue.

## Files
- `blueprint_parser.py` — entrypoint / orchestrator (CLI)
- `wall_detection.py` — grayscale + threshold + morphology
- `room_detection.py` — contour extraction + polygon approximation
- `model_generator.py` — assembles the final JSON model

## Install
```bash
pip install -r requirements.txt
```

## Run
```bash
python3 blueprint_parser.py path/to/blueprint.png
python3 blueprint_parser.py anything.png --mock   # no OpenCV needed
```

## Output
JSON on stdout (the contract the backend reads) and, best-effort, a copy
written to `./output/<basename>.json`.
