#!/usr/bin/env python
"""
Helper script to run Celery worker and beat scheduler.

Usage:
    python run_celery.py worker          # Run worker only
    python run_celery.py beat            # Run beat scheduler only
    python run_celery.py worker-beat     # Run both worker and beat
"""

import sys
import subprocess


def run_worker():
    """Run Celery worker."""
    cmd = [
        "celery",
        "-A", "app.tasks",
        "worker",
        "--loglevel=info",
        "-Q", "alerts,emails,default"
    ]
    subprocess.run(cmd)


def run_beat():
    """Run Celery beat scheduler."""
    cmd = [
        "celery",
        "-A", "app.tasks",
        "beat",
        "--loglevel=info"
    ]
    subprocess.run(cmd)


def run_worker_beat():
    """Run both worker and beat in single process (development only)."""
    cmd = [
        "celery",
        "-A", "app.tasks",
        "worker",
        "--beat",
        "--loglevel=info",
        "-Q", "alerts,emails,default"
    ]
    subprocess.run(cmd)


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python run_celery.py [worker|beat|worker-beat]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "worker":
        print("Starting Celery worker...")
        run_worker()
    elif command == "beat":
        print("Starting Celery beat scheduler...")
        run_beat()
    elif command == "worker-beat":
        print("Starting Celery worker with beat scheduler (development mode)...")
        run_worker_beat()
    else:
        print(f"Unknown command: {command}")
        print("Usage: python run_celery.py [worker|beat|worker-beat]")
        sys.exit(1)


if __name__ == "__main__":
    main()
