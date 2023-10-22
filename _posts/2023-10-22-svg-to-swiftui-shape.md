---
layout: post
title: SVG 转换 SwiftUI Shape
date: 2023-10-22 22:29:56 +0800
categories: SwiftUI
show_excerpt_image: false
hidden_post: false
post_type: Blog
---

周末遇到了 SVG 转 SwiftUI Shape 的场景，发现了这个老项目：[https://swiftvg.mike-engel.com](https://swiftvg.mike-engel.com)

实际用了一下发现这个项目仅支持 UIKit。由于几年没有更新，存在一些问题。基于这个版本，创建一个分支给自己用。

[https://roger.zone/swiftuisvg](https://roger.zone/swiftuisvg){:target="\_blank"}

## 怎么使用

贴上 SVG 代码然后点击转换即可

{% include image.html file="screenshot.png" alt="Screenshot" %}

## 和原项目有什么差异

一些修复，优化以及 SwiftUI 版本支持

- 支持直接贴 SVG（原始项目需要准确的贴一个 d 属性）
- 支持自动换行
- 直接生成 Shape 代码
- 如果包括多个 path 从序号 0 开始依次生成

## 下一步

- 支持更多 SVG 属性
- 生成 Path 对象

> 原项目采用 MIT 协议，我的分支同样保持了 MIT 协议，调整中遇到的问题也已经以 PR 形式反馈给原项目
