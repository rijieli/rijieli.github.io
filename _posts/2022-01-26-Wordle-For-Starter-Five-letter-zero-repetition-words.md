---
layout: post
title: Wordle 起手式 - 五字母零重复单词组
date: 2022-01-26 19:58:00 +0800
categories: Python
show_excerpt_image: true
hidden_post: false
post_type: Blog
cover_image: "/assets/posts/Wordle-For-Starter-Five-letter-zero-repetition-words/Wordle"
---

Wordle 要求玩家具备一定的词汇量才能愉快的享受猜词的趣味，但从游戏的角度来看，它可以设定一组高效的测试单词作为固定的开局方式。虽然这种想法有可能破坏游戏的趣味性，但我仍想尝试这个可能，并对 Wordle 的巧妙设计表示敬意。

这组单词需要满足以下条件:

* 每组包含**四个单词**
* 每个单词有**五个字母**
* 五个字母中**没有重复字母**
* 四个单词中所有字母**没有重复**

我设计了一个小脚本，通过计算来获得满足条件的单词组合，[点击此处](https://github.com/rijieli/wordle)查看源代码。下方列出了一些计算结果。

```
slung  watch  bedim  proxy
chief  balmy  swung  dropt
grown  pylas  bedim  kutch
unfix  embow  stack  glyph
fakir  compt  vends  bulgy
depth  smirk  bacon  gulfy
divot  whack  flung  sperm
furzy  blive  swamp  noght
farce  width  glump  bosky
perch  unbox  swift  glazy
hexad  truck  filmy  spong
whist  pored  mucky  flang
quern  sixth  clomp  gawky
skied  foxly  whang  crumb
glode  barky  chump  snift
pyxle  round  might  backs
gloam  twink  fuchs  predy
spied  brawn  foxly  kutch
shrub  aztec  flowk  dying
ruble  potch  mawks  dying
modal  quegh  swink  crypt
sprew  batch  dungy  jolif
fishy  zante  drock  plumb
shrag  oxfly  unbid  kempt
chips  flunk  grove  bawdy
chirk  bawdy  spent  mogul
shuck  bigot  predy  flawn
lobed  stump  finch  jarvy
tewan  pilch  fjord  busky
dwelt  bunch  favor  skimp
emyds  virtu  bhang  flock
plant  shock  refix  budgy
thumb  eland  grovy  spick
siker  bawdy  potch  flung
segno  thump  dicky  brawl
braky  medoc  whisp  flung
dansk  trump  elbow  chivy
amzel  whist  frock  pudgy
those  bulky  dwang  crimp
sider  potch  flung  mawky
cetin  ampyx  shrug  flowk
batch  mured  gipsy  flown
```