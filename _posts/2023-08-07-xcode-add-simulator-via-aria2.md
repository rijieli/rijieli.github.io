---
layout: post
title: Xcode 通过 aria2 安装模拟器
date: 2023-08-07 14:14:58 +0800
categories: 工具 Xcode
show_excerpt_image: false
hidden_post: false
post_type: Note
---

> 更新：23/12/15 支持 iOS 17 以下模拟器下载链接

Xcode 15 不再内置 iOS 模拟器，改为按需要增量安装。但这项改动带来新的问题：内置的模拟器下载工具速度很慢，而且没有断点续传。下载过程一旦因为网络波动而中断，需要从零重新开始下载。用 aria2 下载非常适合这个场景。

**⚠️ 以下内容需要你拥有开发者账号权限**

> aria2 官方未提供 macOS 版本，如果不想自己编译可以通过 [Homebrew](https://formulae.brew.sh/formula/aria2){:target="\_blank"} 安装

## 寻找下载链接

### iOS 17+

常见的链接结构如下面所示，在开发者官网 [More](https://developer.apple.com/download/all/?q=visionos){:target="\_blank"} 页面搜索得到。

https://download.developer.apple.com/Developer_Tools/iOS_17_beta_4_Simulator_Runtime/iOS_17_beta_4_Simulator_Runtime.dmg

### iOS 16 及以下

**更新：**iOS 17 以下模拟器绑定在 Xcode 中，上面的列表无法搜索得到下载链接，但 Apple 在隐藏文档里列出了相应的链接：_[点我搜索](https://devimages-cdn.apple.com/downloads/xcode/simulators/index2.dvtdownloadableindex)_，打开页面后搜索名称+版本。

## 获取 Cookies

官网提供的下载链接无法直接下载，需要验证开发者账号权限，好在方式比较简单。登录自己的开发者账号，然后通过浏览器开发者面板 Cookies 窗口，寻找 `ADCDownloadAuth` 这个值。

## 下载

替换{Cookies}为上一步获取的值，然后在 Terminal 执行就可以开始下载了。

```bash
aria2c --header "Cookie: ADCDownloadAuth={Cookies}" -c https://download.developer.apple.com/Developer_Tools/visionOS_1_beta_2_Simulator_Runtime/visionOS_1_beta_2_Simulator_Runtime.dmg
```

`-c`: 启用断点续传

`--header`: 添加请求头以通过验证

## 生成脚本

填写好 Cookies 和下载链接，然后点击下方按钮生成脚本，复制到 Terminal 执行即可。

{% include xcode_aria2.html %}

## 安装模拟器

安装包含一组命令，官方教程链接为 [Command Line](https://developer.apple.com/documentation/xcode/installing-additional-simulator-runtimes#Install-and-manage-Simulator-runtimes-from-the-command-line)。精简官方教程得到下方三行命令，通常情况下执行最后一条等待 Xcode 安装和验证模拟器。

```bash
sudo xcode-select -s /Applications/Xcode-15.0.0-Beta.5.app
xcodebuild -runFirstLaunch
xcrun simctl runtime add iOS_17_beta_4_Simulator_Runtime.dmg
```

## 补充

Apple 开发者官网提供了一份 JSON 文档，这份文档包含了所有可用的下载链接，包括 Xcode、模拟器、文档等等。地址为：

https://developer.apple.com/services-account/QH65B2/downloadws/listDownloads.action

链接需认证，具体方法可以研究官方网站的请求，这里不再赘述。
