#!/usr/bin/env python3
"""
BuildSync-3D — blueprint parsing orchestrator.

Reads a blueprint image, runs wall + room detection, builds a 3D model
description, and prints the JSON model to stdout:

    {"rooms": [{"id": "room-1", "polygon": [[x, y], ...], "height": 2.7}, ...],
     "walls": [...]}

Usage:
    python3 blueprint_parser.py <image_path> [--mock] [--out <dir>]

--mock     Skip OpenCV entirely and return a hardcoded sample model.
           Useful for running the API in environments without
           opencv-python installed.
--out DIR  Also write the JSON to DIR/<basename>.json (default: ./output).
"""
import json
import os
import sys

from model_generator import build_model, mock_model


def main():
    if len(sys.argv) < 2:
        print("usage: blueprint_parser.py <image_path> [--mock] [--out <dir>]",
              file=sys.stderr)
        sys.exit(2)

    image_path = sys.argv[1]
    args = sys.argv[2:]
    use_mock = "--mock" in args
    out_dir = "./output"
    if "--out" in args:
        i = args.index("--out")
        if i + 1 < len(args):
            out_dir = args[i + 1]

    try:
        model = mock_model() if use_mock else build_model(image_path)
    except Exception as e:
        print(f"pipeline error: {e}", file=sys.stderr)
        sys.exit(1)

    payload = json.dumps(model)
    print(payload)

    try:
        os.makedirs(out_dir, exist_ok=True)
        base = os.path.splitext(os.path.basename(image_path))[0] or "model"
        with open(os.path.join(out_dir, f"{base}.json"), "w") as f:
            f.write(payload)
    except Exception as e:
        # Output write is best-effort; stdout JSON is the contract.
        print(f"warning: could not write output file: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
