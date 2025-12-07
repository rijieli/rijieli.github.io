# Roger's Homepage

A Jekyll-powered personal website hosted at [roger.zone](https://roger.zone).

## Setup

1. **Ruby version**: Use Ruby 2.7.3 (automatically set by `.ruby-version`)
   ```bash
   rbenv install 2.7.3  # if not installed
   ```

2. **Install dependencies**:
   ```bash
   bundle install
   ```

3. **Run locally**:
   ```bash
   bundle exec jekyll serve --livereload --drafts
   ```
   Visit `http://127.0.0.1:4000/` to view the site

   - `--livereload`: Automatically refresh browser when files change
   - `--drafts`: Include draft posts from `_drafts` folder

## Management Script

Use `./manage.py` for site management:

- `./manage.py -c` - Create new post
- `./manage.py -g` - Generate static templates
- `./manage.py -m [file]` - Convert markdown to Jekyll format
- `./manage.py -u` - Minify tool scripts
- `./manage.py -v` - Run site checks

## Project Structure

- `_posts/` - Blog posts
- `_includes/` - Reusable HTML components
- `_layouts/` - Page layout templates
- `_sass/` - SCSS stylesheets
- `assets/` - Static assets (CSS, JS, images)
- `_subpages/` - Additional site pages
- `assets/tools/` - Interactive JavaScript tools

## Publishing Tools

To add a new JavaScript tool:
1. Create `.js` file in `/assets/tools/source/`
2. Run `./manage.py -u` to minify it
3. Include in HTML with:
   ```liquid
   {%- include tool_scripts.html name="your-tool-name" -%}
   ```
