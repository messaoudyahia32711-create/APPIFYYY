FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pil \
    openjdk-17-jre-headless \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY android-sdk/ ./android-sdk/
COPY android-template/ ./android-template/
COPY scripts/ ./scripts/

# Ensure executable permissions on Linux Android SDK binaries
RUN chmod +x android-sdk/build-tools/aapt* android-sdk/build-tools/zipalign android-sdk/build-tools/apksigner 2>/dev/null || true

ENV PORT=8080
EXPOSE 8080

CMD ["python3", "scripts/builder_server.py"]
