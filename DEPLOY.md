# 部署到 GitHub Pages（三种方式，任选一种）

> 站点是纯静态的（`docs/` 目录），不需要任何构建服务器。
> 部署前先确认本地能构建：`node build.mjs`

---

## 方式一：`main` 分支的 `/docs` 目录（最简单，推荐）

```bash
# 在 page-layout-course 目录下
git init                                  # 若还不是 git 仓库
node build.mjs                            # 生成 docs/
git add -A
git commit -m "feat: 《页面布局之道》双语交互教学网站"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

然后：

1. 打开仓库 **Settings → Pages**
2. **Source** 选择 `Deploy from a branch`
3. **Branch** 选择 `main`，目录选择 **`/docs`**，点 Save
4. 等 1–2 分钟，访问：

```
https://<你的用户名>.github.io/<仓库名>/
```

> `docs/.nojekyll` 已随构建生成，它告诉 GitHub Pages 不要用 Jekyll 处理站点，
> 避免以下划线开头的文件被忽略。

## 方式二：GitHub Actions（每次 push 自动构建发布）

仓库里已经附带 `.github/workflows/deploy.yml`。启用步骤：

1. **Settings → Pages → Source** 选择 **`GitHub Actions`**
2. 之后每次 push 到 `main`，Actions 会自动跑 `node build.mjs` 并把 `docs/` 发布出去
3. 在 Actions 标签页可以看到部署进度，Pages 设置页会显示最终链接

这个方式的好处是：`docs/` 不必提交到仓库（可以用 `.gitignore` 忽略），
站点始终由内容源实时构建，不会出现"忘了重新构建就提交"的问题。

## 方式三：独立仓库做"用户站点"

如果你想得到形如 `https://<你的用户名>.github.io/` 的根链接：

1. 新建一个名为 `<你的用户名>.github.io` 的仓库
2. 把 `docs/` 里的**内容**（不是 `docs` 目录本身）推到该仓库的 `main` 分支根目录
3. **Settings → Pages → Source** 选择 `main` 分支的 `/ (root)`

> 注意：站点使用**相对路径**引用资源（`../assets/...`），
> 因此放在子目录（项目站点）或根目录（用户站点）都可以正常工作。

---

## 本地预览

站点使用 ES Modules，必须通过 HTTP 访问（直接双击 `index.html` 会被 CORS 拦住）：

```bash
# Python（推荐，无需安装依赖）
python -m http.server 8080 --directory docs

# Node（无依赖的等价写法）
npx --yes serve docs

# 局域网内给同事/学生看（找到本机 IP，例如 192.168.1.5）
python -m http.server 8080 --bind 0.0.0.0 --directory docs
```

然后打开 <http://127.0.0.1:8080/>。

## 部署后自检清单

- [ ] 门户、6 个章节页、演示索引页都能打开（8 个 HTML 页面）
- [ ] 右上角语言切换可用，英文模式下没有残留中文正文
- [ ] 每个小节的三个 tab 都能切换，演示 tab 有交互控件
- [ ] 快捷键 `[` `]`、`1` `2` `3` 生效
- [ ] 手机（或开发者工具 320px 宽）下没有横向滚动条
- [ ] 演示索引页的 18 个链接都能正确跳到对应小节的演示 tab

## 常见问题

**Q: 页面样式全丢 / 控制台报 404？**
说明资源路径不对。本站用的是相对路径，所以请确认访问的是目录形式
（`.../repo/`）而不是直接打开文件；如果放在自定义子路径下，把 `docs/` 整体上传即可。

**Q: 语言切换后刷新又变回中文？**
语言状态存在 `localStorage`。若用了无痕模式或禁用了存储，请用 `?lang=en` 显式指定。

**Q: 想改内容？**
改 `src/content/ch*.mjs`（中英字段都在同一处），然后重新 `node build.mjs`。
不要直接改 `docs/` 里的 HTML——那是构建产物，下次构建会被覆盖。
