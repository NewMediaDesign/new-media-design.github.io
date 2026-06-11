#!/usr/bin/env python3
"""
watermark.py — Watermark invisibile batch (blind_watermark, DWT-DCT-SVD)

Incorpora in ogni JPG full-size un payload invisibile "AS-<serie>-<nn>" che
permette di dimostrare la paternita' di una copia in circolazione.
Mantiene un registro (watermark-registry.json) con payload e lunghezza bit,
necessari per l'estrazione/verifica.

I file gia' presenti nel registro vengono saltati (idempotente).

Usage:
  python watermark.py --all                  # tutte le serie
  python watermark.py series-1 series-3      # solo alcune serie
  python watermark.py --verify images/series-1/05.jpg   # verifica un file
  python watermark.py --all --dry-run        # mostra cosa farebbe

Requisiti: pip install -r requirements.txt
NOTA: l'embed riscrive il JPG (quality 95). I master 6000px restano offline:
questo script lavora solo sui file di pubblicazione web.
"""

import argparse
import json
import os
import sys
import tempfile
from datetime import date

try:
    import cv2
    from blind_watermark import WaterMark
    try:
        from blind_watermark import bw_notes
        bw_notes.close()  # silenzia il banner della libreria
    except Exception:
        pass
except ImportError:
    sys.exit("Dipendenze mancanti. Esegui:  pip install -r requirements.txt")

ROOT = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(ROOT, "images")
MANIFEST = os.path.join(ROOT, "manifest.json")
REGISTRY = os.path.join(ROOT, "watermark-registry.json")
JPEG_QUALITY = 95

# Password del watermark: cambiarle rende i watermark esistenti non verificabili.
# Custodire insieme al registry (entrambi servono per provare la paternita').
PWD_IMG = 20260611
PWD_WM = 1989


def load_json(path, default):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return default


def save_registry(reg):
    with open(REGISTRY, "w", encoding="utf-8") as f:
        json.dump(reg, f, indent=2, ensure_ascii=False)
        f.write("\n")


# Template del payload. Più lungo = più bit (≈8/carattere) = robustezza un po' minore,
# ma esplicito e autoesplicativo all'estrazione. {sid}-{img} identifica l'opera.
PAYLOAD_TEMPLATE = "Andrea_Spinazzola_2026_{sid}-{img}"


def make_payload(series_id, filename):
    """images/series-1/05.jpg -> Andrea_Spinazzola_2026_1-05"""
    num = series_id.replace("series-", "")
    base = os.path.splitext(os.path.basename(filename))[0]
    return PAYLOAD_TEMPLATE.format(sid=num, img=base)


def embed(filepath, payload, dry_run=False):
    rel = os.path.relpath(filepath, ROOT).replace("\\", "/")
    if dry_run:
        print(f"  [dry-run] {rel}  <-  '{payload}'")
        return None

    bwm = WaterMark(password_img=PWD_IMG, password_wm=PWD_WM)
    bwm.read_img(filepath)
    bwm.read_wm(payload, mode="str")

    # Embed su PNG temporaneo (lossless), poi ricodifica JPG a qualita' controllata
    tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    tmp.close()
    try:
        bwm.embed(tmp.name)
        img = cv2.imread(tmp.name)
        ok = cv2.imwrite(filepath, img, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
        if not ok:
            raise RuntimeError(f"imwrite fallita su {filepath}")
    finally:
        os.unlink(tmp.name)

    wm_len = len(bwm.wm_bit)

    # Verifica immediata: estrai e confronta
    check = WaterMark(password_img=PWD_IMG, password_wm=PWD_WM)
    extracted = check.extract(filepath, wm_shape=wm_len, mode="str")
    verified = extracted == payload
    status = "ok" if verified else f"MISMATCH (estratto: '{extracted}')"
    print(f"  {rel}  <-  '{payload}'  [{wm_len} bit]  verify: {status}")
    return {"payload": payload, "wm_len": wm_len, "date": str(date.today()), "verified": verified}


def verify(filepath, reg, as_key=None):
    """Verifica un file. Con --as si verifica una COPIA ESTERNA (scaricata/ripubblicata)
    confrontandola con l'entry di registry dell'opera originale.
    NB: la copia deve essere alla risoluzione originale; se è stata ridimensionata,
    riportarla prima alle dimensioni del file originale (il watermark è sincronizzato sui pixel)."""
    key = as_key or os.path.relpath(os.path.abspath(filepath), ROOT).replace("\\", "/")
    entry = reg.get(key)
    if not entry:
        sys.exit(f"'{key}' non presente nel registry — nessun watermark registrato.\n"
                 f"Per verificare una copia esterna: --verify <copia> --as images/series-N/nn.jpg")
    bwm = WaterMark(password_img=PWD_IMG, password_wm=PWD_WM)
    extracted = bwm.extract(filepath, wm_shape=entry["wm_len"], mode="str")
    print(f"file:      {filepath}")
    print(f"opera:     {key}")
    print(f"atteso:    {entry['payload']}")
    print(f"estratto:  {extracted}")
    print("MATCH" if extracted == entry["payload"] else "NO MATCH")


def main():
    ap = argparse.ArgumentParser(description="Watermark invisibile batch")
    ap.add_argument("series", nargs="*", help="es. series-1 series-2")
    ap.add_argument("--all", action="store_true", help="tutte le serie del manifest")
    ap.add_argument("--force", action="store_true", help="ri-embedda anche file gia' nel registry")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--verify", metavar="FILE", help="verifica il watermark di un file")
    ap.add_argument("--as", dest="as_key", metavar="OPERA",
                    help="con --verify: opera di riferimento nel registry (es. images/series-3/01.jpg) per verificare una copia esterna")
    args = ap.parse_args()

    reg = load_json(REGISTRY, {})

    if args.verify:
        verify(args.verify, reg, args.as_key)
        return

    manifest = load_json(MANIFEST, None)
    if not manifest:
        sys.exit("manifest.json non trovato.")

    targets = [s for s in manifest.get("series", [])
               if args.all or s["id"] in args.series]
    if not targets:
        sys.exit("Nessuna serie selezionata. Usa --all o indica le serie (es. series-1).")

    done = skipped = 0
    for s in targets:
        print(f"\n{s['id']} ({s.get('title', '')})")
        for img in s.get("images", []):
            rel = img["filename"]
            filepath = os.path.join(ROOT, rel)
            if not os.path.exists(filepath):
                print(f"  ! file mancante: {rel}")
                continue
            if rel in reg and not args.force:
                skipped += 1
                continue
            entry = embed(filepath, make_payload(s["id"], rel), dry_run=args.dry_run)
            if entry:
                reg[rel] = entry
                save_registry(reg)  # salva subito: interrompibile senza perdita
                done += 1

    print(f"\nFatto: {done} embeddati, {skipped} gia' presenti nel registry.")
    if done and not args.dry_run:
        print("Ricorda: watermark-registry.json + le password nello script servono per la verifica. Backup!")


if __name__ == "__main__":
    main()
