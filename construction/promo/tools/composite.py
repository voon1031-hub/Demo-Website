"""Composite a recorded website onto the laptop screen of a generated video.

usage: python3 composite.py <scene-frames-dir> <site-frames-dir> <corners.json> <out.mp4> [--track] [--fps N]

corners.json: {"quad": [[x,y] top-left, top-right, bottom-right, bottom-left]}
in pixel coordinates of the scene frames (the display area, inside the bezel).
With --track, each scene frame is registered to the first one (ORB + RANSAC on
everything except the screen and the lower-right hand area) so the quad
follows any camera drift.
"""
import json
import os
import subprocess
import sys

import cv2
import numpy as np

scene_dir, site_dir, corners_path, out_path = sys.argv[1:5]
track = "--track" in sys.argv
fps = sys.argv[sys.argv.index("--fps") + 1] if "--fps" in sys.argv else "24"

scenes = sorted(f for f in os.listdir(scene_dir) if f.endswith((".png", ".jpg")))
sites = sorted(f for f in os.listdir(site_dir) if f.endswith((".png", ".jpg")))
n = min(len(scenes), len(sites))
quad0 = np.float32(json.load(open(corners_path))["quad"])

first = cv2.imread(os.path.join(scene_dir, scenes[0]))
H, W = first.shape[:2]
rng = np.random.default_rng(7)

# Feature mask for tracking: skip the screen (its content changes) and the
# lower-right quarter where the hand moves.
feat_mask = np.full((H, W), 255, np.uint8)
cv2.fillConvexPoly(feat_mask, quad0.astype(np.int32), 0)
feat_mask[int(H * 0.62):, int(W * 0.35):] = 0
orb = cv2.ORB_create(4000)
gray0 = cv2.cvtColor(first, cv2.COLOR_BGR2GRAY)
kp0, des0 = orb.detectAndCompute(gray0, feat_mask)
matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)


def quad_for(frame):
    if not track:
        return quad0, 0.0
    kp, des = orb.detectAndCompute(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY), feat_mask)
    if des is None or len(kp) < 20:
        return quad0, -1.0
    m = sorted(matcher.match(des0, des), key=lambda x: x.distance)[:800]
    if len(m) < 20:
        return quad0, -1.0
    a = np.float32([kp0[x.queryIdx].pt for x in m])
    b = np.float32([kp[x.trainIdx].pt for x in m])
    h, inl = cv2.findHomography(a, b, cv2.RANSAC, 2.0)
    if h is None:
        return quad0, -1.0
    q = cv2.perspectiveTransform(quad0[None], h)[0]
    return q, float(np.abs(q - quad0).max())


def soft_mask(q):
    """Anti-aliased quad mask (drawn at 4x, then downsampled)."""
    s = 4
    big = np.zeros((H * s, W * s), np.uint8)
    cv2.fillConvexPoly(big, np.int32(np.round(q * s)), 255, lineType=cv2.LINE_8)
    return cv2.resize(big, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0


# A faint glass reflection: a soft diagonal sheen across the display.
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
sheen = np.clip(1.0 - np.abs((xx / W) * 0.9 + (yy / H) * 1.6 - 0.95) / 0.35, 0, 1) ** 2 * 10.0

# Reels: 1080x1920, H.264 + a silent AAC track for players that expect audio.
enc = subprocess.Popen([
    "ffmpeg", "-loglevel", "error", "-y",
    "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", fps, "-i", "-",
    "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
    "-vf", "scale=1080:-2:flags=lanczos,crop=1080:1920",
    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "96k", "-shortest", "-movflags", "+faststart", out_path,
], stdin=subprocess.PIPE)

drift_log = []
smoothed = None
for i in range(n):
    scene = cv2.imread(os.path.join(scene_dir, scenes[i])).astype(np.float32)
    q, drift = quad_for(scene.astype(np.uint8))
    # Low-pass the tracked corners so tracking noise does not jitter the screen.
    smoothed = q if smoothed is None else smoothed * 0.6 + q * 0.4
    drift_log.append(drift)

    site = cv2.imread(os.path.join(site_dir, sites[i]))
    qw = np.linalg.norm(smoothed[1] - smoothed[0])
    # Downscale the capture close to its on-screen size first, then warp.
    scale = min(1.0, (qw * 1.15) / site.shape[1])
    small = cv2.resize(site, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    sh, sw = small.shape[:2]
    src = np.float32([[0, 0], [sw, 0], [sw, sh], [0, sh]])
    M = cv2.getPerspectiveTransform(src, smoothed.astype(np.float32))
    warped = cv2.warpPerspective(small, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT)
    warped = cv2.GaussianBlur(warped, (0, 0), 0.45).astype(np.float32)
    warped = warped * 0.94 + sheen[..., None]          # emitted light, slight glass sheen
    warped += rng.normal(0, 2.2, warped.shape).astype(np.float32)   # match the video's grain

    m = soft_mask(smoothed)[..., None]
    out = scene * (1 - m) + warped * m
    enc.stdin.write(np.clip(out, 0, 255).astype(np.uint8).tobytes())
    if i % 50 == 0:
        print("frame", i, "drift px", round(drift, 2), flush=True)

enc.stdin.close()
enc.wait()
print("done", n, "frames; max drift", round(max(drift_log), 2), "->", out_path)
