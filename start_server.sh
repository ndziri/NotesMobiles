#!/bin/bash

# Resolve the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DOCS_DIR="$SCRIPT_DIR/docs"

# Check if the docs directory exists
if [ ! -d "$DOCS_DIR" ]; then
    echo "Error: 'docs' directory not found at $DOCS_DIR"
    exit 1
fi

echo "Serving directory: $DOCS_DIR"
cd "$DOCS_DIR" || exit 1

# Check if python3 is available
if command -v python3 &> /dev/null; then
    echo "Starting Python 3 server at http://localhost:8000"
    echo "Opening your browser..."
    # Try different open commands for cross-platform compatibility
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "http://localhost:8000"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:8000"
    fi
    python3 -m http.server 8000
    exit
fi

# Check if python (v2) is available
if command -v python &> /dev/null; then
    echo "Starting Python 2 server at http://localhost:8000"
    echo "Opening your browser..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "http://localhost:8000"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:8000"
    fi
    python -m SimpleHTTPServer 8000
    exit
fi

echo "Could not find Python. Please install Python or use a VS Code extension like 'Live Server'."
