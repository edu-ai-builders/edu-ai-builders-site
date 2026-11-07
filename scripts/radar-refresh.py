#!/usr/bin/env python3
"""Compatibility entry point for the unified directory workflow."""
import runpy
from pathlib import Path

runpy.run_path(str(Path(__file__).with_name('refresh-directory.py')), run_name="__main__")
