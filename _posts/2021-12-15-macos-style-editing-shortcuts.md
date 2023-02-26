---
layout: post
title: macOS 风格的编辑快捷键
date: 2021-12-15 22:54:11 +0800
categories: macOS Tool
show_excerpt_image: false
hidden_post: false
cover_image: "/assets/posts/macos-style-editing-shortcuts/Cover"
---

macOS 具有类似 Emacs 的文本编辑快捷方式，但略有一些区别。以下是一些常用的快捷键组合。[苹果官方文档](https://support.apple.com/zh-cn/HT201236){:target="_blank"}提供了更详细的描述，可以作为本文的拓展。

👉 [在 playground 中尝试快捷键](#playground)

> 系统版本: macOS 11.6.1

| Key Name          | Symbol |
|-------------------|--------|
| Command (or Cmd)  | ⌘      | 
| Option (or Alt)   | ⌥      | 
| Shift             | ⇧      |
| Control (or Ctrl) | ⌃      |

## 移动光标

* `⌃ + F`: Move forward 1 character.
* `⌃ + B`: Move backward 1 character.
* `⌃ + P`: Move to previous line(upward).
* `⌃ + N`: Move to next line(downward).

* `⌃ + A`: Move to the beginning of paragraph.
* `⌃ + E`: Move to the end of paragraph.

* `⌘ + Left`: Move to the beginning of line.
* `⌘ + Right`: Move to the end of line.
* `⌘ + Up`: Move to the beginning of document.
* `⌘ + Down`: Move to the end of document.

* `⌥ + Left`: Move to previous word.
* `⌥ + Right`: Move to next word.

## 删除或粘贴

* `⌃ + D`: Delete forward.
* `⌃ + H`: Delete backward.

* `⌥ + Delete`: Delete 1 word left of cursor.

* `⌃ + K`: Delete text from right of cursor to the line end.
* `⌘ + Delete`: Delete text from left of cursor to the line beginning.
* `⌃ + Y`: Paste text which deleted by `⌃ + K` or `⌘ + Delete`.

## 选择与交换

* `⇧ + ⌘ + Left`: Select text from cursor to the beginning of the line.
* `⇧ + ⌘ + Right`: Select text from cursor to the end of the line.
* `⇧ + ⌥ + Left`: Select 1 word left of cursor, this shortcuts can use more than 1 time.
* `⇧ + ⌥ + Right`: Select 1 word right of cursor, this shortcuts can use more than 1 time.
* `⇧ + Left`: Select 1 character left of cursor, this shortcuts can use more than 1 time.
* `⇧ + Right`: Select 1 character right of cursor, this shortcuts can use more than 1 time.

* `⌃ + T`: Swap 1 character between cursor, e.g. `ie` -> `ei`.

## Playground

你可以在下面的文本框尝试这些快捷键组合，所有的改动可以在刷新页面后还原。

<textarea id="shortcuts-playground" style="font-family: serif; background: #fafafa; width: 100%; box-sizing: border-box; border-radius: 8px; padding: 15px; font-size: 17px;" rows ="18">
A Fairy Song
by William Shakespeare

Over hill, over dale,
Thorough bush, thorough brier,
Over park, over pale,
Thorough flood, thorough fire!
I do wander everywhere,
Swifter than the moon's sphere;
And I serve the Fairy Queen,
To dew her orbs upon the green;
The cowslips tall her pensioners be;
In their gold coats spots you see;
Those be rubies, fairy favours;
In those freckles live their savours;
I must go seek some dewdrops here,
And hang a pearl in every cowslip's ear.</textarea>