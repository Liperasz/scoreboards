# ambiente para gerar o apk: jdk, node e android sdk (o build em si está no docker-compose.yml)

# node vem da imagem oficial, mais simples que instalar por repositório
FROM node:22-bookworm-slim AS node

FROM eclipse-temurin:17-jdk-jammy

# versões pedidas pelo expo sdk 58 (react native 0.88)
ARG CMDLINE_TOOLS=13114758
ARG ANDROID_PLATFORM=37.0
ARG ANDROID_BUILD_TOOLS=37.0.0
ARG ANDROID_NDK=27.1.12297006
ARG ANDROID_CMAKE=3.22.1

ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$PATH:/opt/android-sdk/cmdline-tools/latest/bin:/opt/android-sdk/platform-tools
# evita perguntas interativas do expo e do npm
ENV CI=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip wget git rsync \
    && rm -rf /var/lib/apt/lists/*

COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# o zip vem com a pasta cmdline-tools, que precisa virar cmdline-tools/latest
RUN mkdir -p $ANDROID_HOME/cmdline-tools \
    && wget -q https://dl.google.com/android/repository/commandlinetools-linux-${CMDLINE_TOOLS}_latest.zip -O /tmp/tools.zip \
    && unzip -q /tmp/tools.zip -d $ANDROID_HOME/cmdline-tools \
    && mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest \
    && rm /tmp/tools.zip

RUN yes | sdkmanager --licenses > /dev/null \
    && sdkmanager \
        "platform-tools" \
        "platforms;android-${ANDROID_PLATFORM}" \
        "build-tools;${ANDROID_BUILD_TOOLS}" \
        "ndk;${ANDROID_NDK}" \
        "cmake;${ANDROID_CMAKE}"

WORKDIR /build
