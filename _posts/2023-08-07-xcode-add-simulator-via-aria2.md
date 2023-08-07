---
layout: post
title: Xcode 通过 aria2 安装模拟器
date: 2023-08-07 14:14:58 +0800
categories: Uncategorized
show_excerpt_image: false
hidden_post: false
post_type: Note
---

Xcode 15 一个重大的改动是不再内置模拟器，而是通过增量安装。好处是节省空间，但自带的下载器速度很慢，而且没有断点续传，下载过程出现网络波动，中断需要从头开始下载。用 aria2 下载非常适合这个场景。

**⚠️下面的内容需要你拥有开发者账号权限**

> aria2 官方没有提供 macOS 客户端，如果不想自己编译可以通过 Homebrew 安装

## 寻找下载链接

常见的下载链接如下面所示，可以在开发者官网 [More](https://developer.apple.com/download/all/?q=visionos) 这个页面搜索得到。

https://download.developer.apple.com/Developer_Tools/iOS_17_beta_4_Simulator_Runtime/iOS_17_beta_4_Simulator_Runtime.dmg

## 获取 Cookies

官网提供的下载链接是无法直接下载，需要验证开发者账号权限，不过方式比较简单，在官网登录账号，然后浏览器打开 Cookies 窗口，寻找 `ADCDownloadAuth` 这个值。

## 下载

替换{Cookies}为上一步获取的值，然后在 Terminal 执行就可以开始下载了。

```bash
aria2c --header "Cookie: ADCDownloadAuth={Cookies}" -c https://download.developer.apple.com/Developer_Tools/visionOS_1_beta_2_Simulator_Runtime/visionOS_1_beta_2_Simulator_Runtime.dmg
```

`-c`: 启用断点续传

`--header`: 添加请求头以通过验证

## 安装

安装同样是一组命令，官方教程在 [Command Line](https://developer.apple.com/documentation/xcode/installing-additional-simulator-runtimes#Install-and-manage-Simulator-runtimes-from-the-command-line)。精简一下就是下方这三行。

```bash
sudo xcode-select -s /Applications/Xcode-15.0.0-Beta.5.app
xcodebuild -runFirstLaunch
xcrun simctl runtime add iOS_17_beta_4_Simulator_Runtime.dmg
```