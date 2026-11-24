#!/usr/bin/env bash
set -euo pipefail

# converte as fotos de fundo para webp pequeno: 480x854 (9:16), leve desfoque e qualidade baixa
# uso: npm run optimize-bg -- <pasta com as fotos>   (o nome do arquivo sem extensão é o id do jogo)

SRC="${1:?informe a pasta com as fotos originais}"
OUT="$(dirname "$0")/../assets/bg"
QUALITY="${QUALITY:-55}"

mkdir -p "$OUT"

for file in "$SRC"/*; do

    id="$(basename "${file%.*}")"

    # [0] pega só o primeiro quadro (gif, tiff com várias páginas)
    magick "${file}[0]" \
        -auto-orient \
        -resize '480x854^' \
        -gravity center \
        -extent 480x854 \
        -blur 0x1.5 \
        -strip \
        -quality "$QUALITY" \
        -define webp:method=6 \
        "$OUT/$id.webp"

    printf '%-16s %s\n' "$id" "$(du -h "$OUT/$id.webp" | cut -f1)"

done
