---
layout: post
title: 通过指定 Unicode 范围裁剪 TTF 字体文件
date: 2023-10-25 01:03:00 +0800
original_date: 2022-04-14 15:18:59 +0800
categories: Python
show_excerpt_image: false
hidden_post: false
post_type: Note
cover_image: /assets/posts/reduce-ttf-font-file-size-using-python/TTF
---

> 更新：23/10/25 更新脚本，保留更多字体细节
>
> 更新：23/07/26 补充一个实用小脚本

最近尝试为博客添加自定义字体，以在不同的浏览器上实现视觉一致性。你可能已经了解了 `@font-face` 这个 CSS 属性：

```css
@font-face {
  font-family: "FontName";
  src: url("/assets/FontFile.ttf");
}
```

但是在某些特定情况下，我们只需要字体文件的一小部分（英文字母或某些特殊符号），但是字体创建者没有提供小字体集版本。

## 简易方法

我们可以使用 Python [fontTools](https://github.com/fonttools/fonttools) 库手动减少字体文件大小，这个工具专注于合并、裁剪子集和转换字体文件。对于减小字体文件大小的场景，可以使用这个库提供的 `pyftsubset` 命令，最简单的方法是：

```shell
# 安装 fonttools，我使用的是 4.32.0 版本。
pip install fonttools
pyftsubset Input.ttf --output-file=Output.ttf --unicodes=U+0000-007F
```

两个基本的参数含义分别为：

`--output-file=`：输出文件名。

`--unicodes=`：以十六进制数字指定 Unicode 范围。比如 `U+0000-0007F` 表示 ASCII 码。

要查看更多选项，请访问 [fontTools 文档](https://fonttools.readthedocs.io/en/latest/subset/index.html)。

## 实用小脚本版本 2（23.10.25 更新）

下方的脚本补充了更丰富的参数，使用方法同[版本 1](#实用小脚本版本-120230726-更新)，区别在于可以保留 Features 和一些必要的扩展字符集合等等，最终文件会略大一些。如果只是简易的裁剪，仍然推荐使用[版本 1](#实用小脚本版本-120230726-更新)。

```
#!/bin/bash

if [[ $# -lt 1 || !($1 == *.otf || $1 == *.ttf) ]]; then
  echo "Use VENV: source ./env/bin/activate"
  echo "Usage: subascii <fontfile.otf/ttf> [pyftsubset options...]"
  exit 1
fi

filename=$(basename -- "$1")
extension="${filename##*.}"
filename="${filename%.*}"

pyftsubset "$1" --output-file="${filename}-Sub.${extension}" --unicodes="U+0000-007F" "${@:2}" \
  --layout-features='*' --glyph-names --symbol-cmap --legacy-cmap \
  --notdef-glyph --notdef-outline --recommended-glyphs \
  --name-IDs='*' --name-legacy --name-languages='*'
```

## 实用小脚本版本 1（2023.07.26 更新）

分享一个小脚本，要求已经安装`fonttools`，运行后会产生一个 ASCII 子集的新文件，文件名结尾加`-Sub`

用法举例：`./subascii.sh Rubik.ttf` 得到 `Rubik-sub.ttf`

下面的保存为`subascii.sh`

```
#!/bin/bash

if [[ $# -lt 1 || !($1 == *.otf || $1 == *.ttf) ]]; then
  echo "Use VENV: source ./env/bin/activate"
  echo "Usage: subascii <fontfile.otf/ttf> [pyftsubset options...]"
  exit 1
fi

filename=$(basename -- "$1")
extension="${filename##*.}"
filename="${filename%.*}"

pyftsubset "$1" --output-file="${filename}-Sub.${extension}" --unicodes=U+0000-007F "${@:2}"
```

## 实际效果

这个结果可能没有实际意义，因为它取决于指定的 Unicode 范围大小，以及具体参数配置。以下是基于 `RobotoCondensed-Bold.ttf` 裁剪后的比对。

```
Input.ttf   162K
Output.ttf   22K
```

## 在哪里找到字体文件？

**注意**，字体并不总是被允许修改，请仔细查看字体使用许可证。

- [Google Fonts](http://fonts.google.com)
- [Adobe Fonts](https://fonts.adobe.com)
- [Hello Font](https://www.hellofont.cn)

## 在哪里找到 Unicode 编码？

- [Unicode 图表](http://www.unicode.org/charts/)
- [Unicode 查询](https://unicodelookup.com)
