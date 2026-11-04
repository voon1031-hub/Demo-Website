"""Find when the hand swipes and whether the camera drifts.

usage: python3 analyze.py <frames-dir> <fps> <hand box x0,y0,x1,y1> <screen quad json>
Prints per-frame hand motion energy (frame difference inside the hand box)
and the camera drift measured on everything outside the screen and hand box.
"""
import json
import os
import sys

import cv2
import numpy as np

d, fps = sys.argv[1], float(sys.argv[2])
x0, y0, x1, y1 = map(int, sys.argv[3].split(","))
quad = np.float32(json.load(open(sys.argv[4]))["quad"])
files = sorted(f for f in os.listdir(d) if f.endswith(".png"))
frames = [cv2.imread(os.path.join(d, f)) for f in files]
H, W = frames[0].shape[:2]

mask = np.full((H, W), 255, np.uint8)
cv2.fillConvexPoly(mask, quad.astype(np.int32), 0)
mask[y0:y1, x0:x1] = 0
orb = cv2.ORB_create(4000)
g0 = cv2.cvtColor(frames[0], cv2.COLOR_BGR2GRAY)
kp0, des0 = orb.detectAndCompute(g0, mask)
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

energy, drift = [0.0], [0.0]
prev = cv2.GaussianBlur(cv2.cvtColor(frames[0][y0:y1, x0:x1], cv2.COLOR_BGR2GRAY), (5, 5), 0).astype(np.float32)
for f in frames[1:]:
    cur = cv2.GaussianBlur(cv2.cvtColor(f[y0:y1, x0:x1], cv2.COLOR_BGR2GRAY), (5, 5), 0).astype(np.float32)
    energy.append(float(np.abs(cur - prev).mean()))
    prev = cur
    kp, des = orb.detectAndCompute(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), mask)
    m = sorted(bf.match(des0, des), key=lambda x: x.distance)[:800]
    a = np.float32([kp0[x.queryIdx].pt for x in m])
    b = np.float32([kp[x.trainIdx].pt for x in m])
    h, _ = cv2.findHomography(a, b, cv2.RANSAC, 2.0)
    q = cv2.perspectiveTransform(quad[None], h)[0]
    drift.append(float(np.abs(q - quad).max()))

for i, (e, dr) in enumerate(zip(energy, drift)):
    bar = "#" * int(min(60, e * 6))
    print(f"{i:4d} {i / fps:6.2f}s  drift {dr:5.2f}px  {bar}")
json.dump({"energy": energy, "drift": drift}, open(os.path.join(d, "analysis.json"), "w"))
