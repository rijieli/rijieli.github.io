---
layout: post
title: Caution Tape Border with CALayer
date: 2026-07-16 21:30:00 +0800
categories: UIKit
show_excerpt_image: false
hidden_post: false
post_type: Blog
---

This is an intermediate product from one of my projects. The feature was not in use, but the view itself is a fun little thing: a caution tape-style border (yellow and black stripes) drawn around a rounded rect. Several interesting attempts were made. Rather than discarding them outright, I have documented the attempts here.

## First attempt: mask a striped fill with the stroke

My first attempt was much clumsier: draw a pure yellow rounded rect, then copy a rotated black rectangle over it again and again:

<svg viewBox="0 0 320 120" width="320" style="max-width: 100%;">
  <defs>
    <pattern id="tape-stripes-fill" width="28" height="28" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <rect width="28" height="28" fill="#FFD700"/>
      <rect width="14" height="28" fill="#000"/>
    </pattern>
  </defs>
  <rect width="320" height="120" rx="24" fill="url(#tape-stripes-fill)"/>
</svg>

then use the border stroke as a mask to cut out the ring:

<svg viewBox="0 0 320 120" width="320" style="max-width: 100%;">
  <defs>
    <pattern id="tape-stripes-ring" width="28" height="28" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <rect width="28" height="28" fill="#FFD700"/>
      <rect width="14" height="28" fill="#000"/>
    </pattern>
    <mask id="tape-ring-mask">
      <rect x="6" y="6" width="308" height="108" rx="18" fill="none" stroke="#fff" stroke-width="12"/>
    </mask>
  </defs>
  <rect width="320" height="120" rx="24" fill="url(#tape-stripes-ring)" mask="url(#tape-ring-mask)"/>
</svg>

It did render, but the stripes do not follow the path. Look at the top left and bottom right corners: the bars run almost parallel to the arc there, and the rhythm falls apart. So I threw it away.

## Second attempt: rotate a bar around the center

The yellow rounded rect stays as the background. This time the black rectangle is as long as the long side, rotated around the center and copied n times. The angles are not uniform, they are picked so the bars land evenly on the border:

<svg viewBox="0 0 320 120" width="320" style="max-width: 100%;">
  <rect width="320" height="120" rx="24" fill="#FFD700"/>
  <g fill="#000">
    <rect x="-40" y="53" width="400" height="14" transform="rotate(6.2 160 60)"/>
    <rect x="-40" y="53" width="400" height="14" transform="rotate(18.1 160 60)"/>
    <rect x="-40" y="53" width="400" height="14" transform="rotate(24.8 160 60)"/>
    <rect x="-40" y="53" width="400" height="14" transform="rotate(32.9 160 60)"/>
    <rect x="-40" y="53" width="400" height="14" transform="rotate(47.1 160 60)"/>
    <rect x="-40" y="53" width="400" height="14" transform="rotate(72.8 160 60)"/>
    <rect x="-40" y="53" width="400" height="14" transform="rotate(107.1 160 60)"/>
    <rect x="-40" y="53" width="400" height="14" transform="rotate(132.8 160 60)"/>
    <rect x="-40" y="53" width="400" height="14" transform="rotate(147.1 160 60)"/>
    <rect x="-40" y="53" width="400" height="14" transform="rotate(155.2 160 60)"/>
    <rect x="-40" y="53" width="400" height="14" transform="rotate(161.9 160 60)"/>
    <rect x="-40" y="53" width="400" height="14" transform="rotate(173.8 160 60)"/>
  </g>
</svg>

then mask again:

<svg viewBox="0 0 320 120" width="320" style="max-width: 100%;">
  <defs>
    <mask id="tape-spoke-mask">
      <rect x="6" y="6" width="308" height="108" rx="18" fill="none" stroke="#fff" stroke-width="12"/>
    </mask>
  </defs>
  <g mask="url(#tape-spoke-mask)">
    <rect width="320" height="120" rx="24" fill="#FFD700"/>
    <g fill="#000">
      <rect x="-40" y="53" width="400" height="14" transform="rotate(6.2 160 60)"/>
      <rect x="-40" y="53" width="400" height="14" transform="rotate(18.1 160 60)"/>
      <rect x="-40" y="53" width="400" height="14" transform="rotate(24.8 160 60)"/>
      <rect x="-40" y="53" width="400" height="14" transform="rotate(32.9 160 60)"/>
      <rect x="-40" y="53" width="400" height="14" transform="rotate(47.1 160 60)"/>
      <rect x="-40" y="53" width="400" height="14" transform="rotate(72.8 160 60)"/>
      <rect x="-40" y="53" width="400" height="14" transform="rotate(107.1 160 60)"/>
      <rect x="-40" y="53" width="400" height="14" transform="rotate(132.8 160 60)"/>
      <rect x="-40" y="53" width="400" height="14" transform="rotate(147.1 160 60)"/>
      <rect x="-40" y="53" width="400" height="14" transform="rotate(155.2 160 60)"/>
      <rect x="-40" y="53" width="400" height="14" transform="rotate(161.9 160 60)"/>
      <rect x="-40" y="53" width="400" height="14" transform="rotate(173.8 160 60)"/>
    </g>
  </g>
</svg>

The gaps are even this time, but the widths are not: every bar meets the border at a different angle, so some black segments stay slim while others smear into long streaks. And the angle list has to be recomputed for every size. Threw it away again.

## The final version: two strokes on one path

The final idea is simple: stack two `CAShapeLayer` with the same rounded rect path. The bottom one strokes solid yellow, the top one strokes black with a `lineDashPattern`, so the dash gaps reveal the yellow underneath.

This is what it looks like:

<svg viewBox="0 0 320 120" width="320" style="max-width: 100%;">
  <rect x="6" y="6" width="308" height="108" rx="18" fill="none" stroke="#FFD700" stroke-width="12"/>
  <rect x="6" y="6" width="308" height="108" rx="18" fill="none" stroke="#000" stroke-width="12" pathLength="58" stroke-dasharray="1 1"/>
</svg>

Note the dashes bend around the corners by themselves. That is the whole appeal of stroking a path instead of tiling a striped image: no slicing, no `resizableImage`, and any corner radius just works.

## The tricky part: making the stripes meet

If you hardcode a dash pattern like `[14, 14]`, the last segment almost never lands where the first one starts, leaving an ugly seam at the path's starting point:

<svg viewBox="-14 -14 348 148" width="308" style="max-width: 100%;">
  <rect x="6" y="6" width="308" height="108" rx="18" fill="none" stroke="#FFD700" stroke-width="12"/>
  <rect x="6" y="6" width="308" height="108" rx="18" fill="none" stroke="#000" stroke-width="12" stroke-dasharray="14 14"/>
  <circle cx="24" cy="6" r="16" fill="none" stroke="#FF3B30" stroke-width="2"/>
</svg>

The fix is to measure the real perimeter, then scale the dash so it fits a whole number of times. For a rounded rect the perimeter has a closed form: four straight edges shortened by the corners, plus four quarter circles.

```swift
// 2 * (w + h) - 8 * r  straight parts
//     + 2 * .pi * r    four quarter arcs
let perimeter = 2 * (width + height) + radius * (2 * .pi - 8)

let segmentCount = max(1, Int((perimeter / (2 * 14)).rounded()))
let segmentLength = perimeter / CGFloat(2 * segmentCount)
lineDashPattern = [segmentLength as NSNumber, segmentLength as NSNumber]
```

`14` is the target segment length. The actual length is stretched or squeezed a little so that the pattern repeats a whole number of times and closes the loop perfectly:

<svg viewBox="-14 -14 348 148" width="308" style="max-width: 100%;">
  <rect x="6" y="6" width="308" height="108" rx="18" fill="none" stroke="#FFD700" stroke-width="12"/>
  <rect x="6" y="6" width="308" height="108" rx="18" fill="none" stroke="#000" stroke-width="12" pathLength="58" stroke-dasharray="1 1"/>
</svg>

Note that the path is stroked at `insetBy(dx: lineWidth / 2, dy: lineWidth / 2)`, so the perimeter must be calculated from the inset size and the reduced corner radius as well, otherwise the last segment still drifts.

## Interruptible animation

The border can appear, disappear, and change frame at any time. So `update` captures `presentation()?.opacity` and `presentation()?.path` first, then animates from those values. If an animation is interrupted halfway, the new one starts from where the layer visually is, not from the stale model value.

## Full code

```swift
import UIKit

final class CautionTapeBorder {
    let layer = CALayer()
    private let yellowLayer = CAShapeLayer()
    private let blackLayer = CAShapeLayer()

    init() {
        layer.opacity = 0
        yellowLayer.fillColor = nil
        yellowLayer.strokeColor = UIColor(red: 1, green: 0.84, blue: 0, alpha: 1).cgColor
        blackLayer.fillColor = nil
        blackLayer.strokeColor = UIColor.black.cgColor
        layer.addSublayer(yellowLayer)
        layer.addSublayer(blackLayer)
    }

    func update(
        frame: CGRect,
        cornerRadius: CGFloat,
        lineWidth: CGFloat,
        isVisible: Bool,
        animated: Bool
    ) {
        let previousOpacity = layer.presentation()?.opacity ?? layer.opacity
        let previousPath = yellowLayer.presentation()?.path ?? yellowLayer.path
        let path: CGPath = {
            guard lineWidth > 0, frame.width > 0, frame.height > 0 else {
                return CGMutablePath()
            }

            let inset = lineWidth / 2
            let strokeRect = CGRect(origin: .zero, size: frame.size).insetBy(dx: inset, dy: inset)
            guard strokeRect.width > 0, strokeRect.height > 0 else { return CGMutablePath() }
            return UIBezierPath(
                roundedRect: strokeRect,
                cornerRadius: max(0, cornerRadius - inset)
            ).cgPath
        }()
        let width = max(0, frame.width - lineWidth)
        let height = max(0, frame.height - lineWidth)
        let radius = min(max(0, cornerRadius - lineWidth / 2), min(width, height) / 2)
        let perimeter = 2 * (width + height) + radius * (2 * .pi - 8)
        let lineDashPattern: [NSNumber]?
        if perimeter > 0 {
            let segmentCount = max(1, Int((perimeter / (2 * 14)).rounded()))
            let segmentLength = perimeter / CGFloat(2 * segmentCount)
            lineDashPattern = [segmentLength as NSNumber, segmentLength as NSNumber]
        } else {
            lineDashPattern = nil
        }
        let newOpacity: Float = isVisible && lineWidth > 0 ? 1 : 0

        CATransaction.begin()
        CATransaction.setDisableActions(true)
        layer.frame = frame
        layer.opacity = newOpacity
        yellowLayer.frame = layer.bounds
        yellowLayer.path = path
        yellowLayer.lineWidth = lineWidth
        blackLayer.frame = layer.bounds
        blackLayer.path = path
        blackLayer.lineWidth = lineWidth
        blackLayer.lineDashPattern = lineDashPattern
        CATransaction.commit()

        guard animated else { return }

        if previousOpacity != newOpacity {
            let opacityAnimation = CABasicAnimation(keyPath: "opacity")
            opacityAnimation.fromValue = previousOpacity
            opacityAnimation.toValue = newOpacity
            opacityAnimation.duration = 0.2
            opacityAnimation.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
            layer.add(opacityAnimation, forKey: "cautionOpacityTransition")
        }

        if previousOpacity > 0 || newOpacity > 0, previousPath != path {
            let pathAnimation = CABasicAnimation(keyPath: "path")
            pathAnimation.fromValue = previousPath
            pathAnimation.toValue = path
            pathAnimation.duration = 0.2
            pathAnimation.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
            yellowLayer.add(pathAnimation, forKey: "cautionPathTransition")
            blackLayer.add(pathAnimation, forKey: "cautionPathTransition")
        }
    }
}
```
