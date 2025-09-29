# Roger's Homepage

Roger's homepage powered by [Jekyll](https://jekyllrb.com), hosted on [GitHub Pages](https://pages.github.com).

## Getting Started

1.  **Set up Ruby:** Make sure you are using Ruby `2.7.3`. If you're using `rbenv`, you can set the local Ruby version with:
    ```bash
    rbenv local 2.7.3
    ```

2.  **Install Dependencies:** Install the required gems.
    ```bash
    gem install bundler:2.3.10
    bundle install
    ```

3.  **Run the Server:** Build the site and run a local server.
    ```bash
    bundle exec jekyll serve --livereload --drafts
    ```
    The site will be available at `http://127.0.0.1:4000/`.

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
