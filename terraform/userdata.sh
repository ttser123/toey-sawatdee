#!/bin/bash
dnf update -y
dnf install -y docker
systemctl enable docker
systemctl start docker

docker run -d \
  -p 80:3000 \
  --name toey-sawatdee \
  --restart unless-stopped \
  ghcr.io/ttser123/toey-sawatdee:latest