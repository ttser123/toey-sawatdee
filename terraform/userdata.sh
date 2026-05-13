#!/bin/bash
dnf update -y
dnf install -y docker
systemctl enable docker
systemctl start docker

