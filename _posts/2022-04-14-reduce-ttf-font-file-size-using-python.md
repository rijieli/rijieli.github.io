---
layout: post
title: 通过指定 Unicode 范围裁剪 TTF 字体文件
date: 2022-04-14 15:18:59 +0800
categories: Python
show_excerpt_image: false
hidden_post: false
post_type: Note
cover_image: /assets/posts/reduce-ttf-font-file-size-using-python/TTF
---

最近尝试为博客添加自定义字体，以在不同的浏览器上实现视觉一致性。你可能已经了解了 `@font-face` 这个 CSS 属性：

```css
@font-face {
  font-family: "FontName";
  src: url("/assets/FontFile.ttf");
}
```

但是在某些特定情况下，我们只需要字体文件的一小部分（英文字母或某些特殊符号），但是字体创建者没有提供小字体集版本。我们可以使用 Python 库 `fonttools` 手动减少字体文件大小，以下是一个简单的记录：

```shell
mkdir font-reduce && cd font-reduce
# 创建 Python 环境，此步骤可以跳过。
python3 -m venv env
. env/bin/activate
# 安装 fonttools，我使用的是 4.32.0 版本。
pip install fonttools
pyftsubset Input.ttf --output-file=Output.ttf --unicodes=U+0000-007F
```

[fontTools](https://github.com/fonttools/fonttools) 库专注于合并、裁剪子集和转换字体文件。如果目的是减小字体文件大小，可以使用 `pyftsubset` 命令，有两个涉及到的参数：

`--output-file=`：输出文件名。

`--unicodes=`：以十六进制数字指定 Unicode 范围。比如 `U+0000-0007F` 表示 ASCII 码。

要查看更多选项，请访问 [fontTools 文档](https://fonttools.readthedocs.io/en/latest/subset/index.html)。

## 实际效果

这个结果可能没有实际意义，因为它取决于 Unicode 范围的大小。以下是基于 `RobotoCondensed-Bold.ttf` 裁剪后的比对。

```
Input.ttf   162K
Output.ttf   22K
```

## 在哪里找到字体文件？

**注意**，字体并不总是被允许修改，请仔细查看字体使用许可证。

* [Google Fonts](http://fonts.google.com)
* [Adobe Fonts](https://fonts.adobe.com)
* [Hello Font](https://www.hellofont.cn)

## 在哪里找到 Unicode 编码？

* [Unicode 图表](http://www.unicode.org/charts/)
* [Unicode 查询](https://unicodelookup.com)