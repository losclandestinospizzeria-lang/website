# imageChanger

Utility per convertire e ridimensionare immagini in formato WebP.

## Requisiti

```bash
pip install pillow
```

## Utilizzo

Tutti i comandi vanno eseguiti dalla directory `utils/imageChanger/` con il venv attivo:

```bash
source .venv/bin/activate
```

---

### Convertire immagini in WebP

Converte uno o più file (o un'intera directory) in `.webp`.

```bash
python convert_to_webp.py <file_o_dir> [<file_o_dir> ...]
python convert_to_webp.py --quality 80 --max-width 1200 foto.jpg
python convert_to_webp.py --quality 75 pics/
```

| Opzione | Default | Descrizione |
|---|---|---|
| `--quality` | 75 | Qualità WebP (1–100) |
| `--max-width` | auto* | Larghezza massima in pixel |

*Il max-width automatico dipende dal nome del file: `logo*`→320, `external*`→1920, `internal*`→1200, altri→1920.

---

### Thumbnail singolo

Genera un thumbnail WebP da un file sorgente con input e output espliciti.

```bash
python convert_to_webp.py --thumb <SRC_FILE> <OUT_FILE>
python convert_to_webp.py --thumb diavola.png pizza-diavola-thumb.webp
python convert_to_webp.py --thumb diavola.png pizza-diavola-thumb.webp --thumb-width 400 --quality 80
```

| Opzione | Default | Descrizione |
|---|---|---|
| `--thumb-width` | 600 | Larghezza del thumbnail in pixel |
| `--quality` | 75 | Qualità WebP (1–100) |

Se la sorgente è già più stretta del target, viene salvata senza upscale.

---

### Thumbnail per directory intera (gallery)

Genera `<nome>-thumb.webp` (600px) per tutte le immagini di gallery in una directory.  
Salta automaticamente: `logo*`, `external*`, `internal*`, `favicon*`, e file già con suffisso `-thumb`, `-480`, `-640`, `-960`.

```bash
python convert_to_webp.py --gallery-thumbs <PICS_DIR>
python convert_to_webp.py --gallery-thumbs ../../v2/assets/pics/
```

---

### Varianti responsive per hero image

Genera varianti a 480px, 640px e 960px di larghezza per uso srcset.

```bash
python convert_to_webp.py --responsive-hero <HERO_FILE>
python convert_to_webp.py --responsive-hero ../../v2/assets/pics/external.webp
```

---

### Favicon

Genera `favicon.ico` (16×16, 32×32, 48×48) e `favicon-32.png` da un'immagine logo.

```bash
python convert_to_webp.py --favicons <LOGO_FILE>
python convert_to_webp.py --favicons ../../v2/assets/pics/logo.png
```

---

### Rotazione immagine

Ruota un'immagine e la sovrascrive in place.  
Gradi negativi = senso orario, positivi = antiorario.

```bash
python convert_to_webp.py --rotate <IMAGE_PATH> <DEGREES>
python convert_to_webp.py --rotate foto.webp -90
```

---

### Upscale (miglioramento risoluzione)

Ingrandisce un'immagine usando resampling LANCZOS con sharpening opzionale.

```bash
python upscale_image.py <image> [options]
python upscale_image.py photo.webp
python upscale_image.py photo.webp --scale 3
python upscale_image.py photo.webp --width 2400
python upscale_image.py photo.webp --width 2400 --height 1600 -o big.webp
```

Oppure tramite shell wrapper:

```bash
./upscaleImage.sh photo.webp --scale 3
./upscaleImage.sh photo.webp --width 2400 -o big.webp
```

| Opzione | Default | Descrizione |
|---|---|---|
| `--scale` | 2.0 | Fattore di scala (ignorato se `--width` o `--height`) |
| `--width` | — | Larghezza target in pixel (mantiene proporzioni) |
| `--height` | — | Altezza target in pixel (mantiene proporzioni) |
| `-o` / `--output` | auto | Percorso output (default: `<nome>-upscaled.<ext>`) |
| `--no-sharpen` | false | Disabilita lo sharpening post-upscale |
| `--quality` | 90 | Qualità output WebP/JPEG (1–100) |

---

### Combinare più operazioni

I flag sono combinabili in un unico comando:

```bash
python convert_to_webp.py --thumb src.png out-thumb.webp --quality 80 src2.jpg
```
