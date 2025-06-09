#!/bin/bash
set -e

check_docker() {
    if ! command -v docker &> /dev/null
    then
        echo "Docker sistemde yüklü değil."
        exit 1
    fi

    if ! docker info &> /dev/null
    then
        echo "Docker daemon çalışmıyor."
        exit 1
    fi
}

check_docker

echo "Projenin Docker imajı build ediliyor..."
docker build -t personeltayin:latest .
