# Roger's Homepage

Roger's homepage powered by [Jekyll](https://jekyllrb.com), hosted on [GitHub Pages](https://pages.github.com).

## Install Locally

```bash
brew install rbenv ruby-build
rbenv init # Or add eval "$(rbenv init - zsh)" to rc file
rbenv install 2.7.3
echo 2.7.3 > .ruby-version
gem inst ffi -- --disable-system-libffi
bundle install
bundle exec jekyll serve

# Build inlcude drafts
bundle exec jekyll serve --drafts
```

## Manage Script

Usage: `./manage.py [-cgvumwd] [input]`

```
-c:     create post
-g:     generate static templates
-v:     do some check job
-m:     covert a normal markdown file to jekyll format
-u:     uglify scripts in tools folder
-wd:    parse weixin article meta data
```

## Template Usage

Use global HTML header.

```
<head>
  {% include head_basic.html %}
<head>
```

## Publish Tool

Move JavaScript file to `/assets/tools/source` then run `./manage.py -u`.

```
{%- include tool_scripts.html name="theme-color-preview" -%}
```

## Notification Template

`auto-dismiss` will make it dismiss after 4 seconds.

```
<div class="notification card-background auto-dismiss">
    <p class="notification-content" >⚠️ notification here <a href="mailto:{{ site.email }}">mail me</a>.</p>
    <div class="notification-date">Mar 25</div>
</div>
```

## Dependencies Versions

https://pages.github.com/versions/
