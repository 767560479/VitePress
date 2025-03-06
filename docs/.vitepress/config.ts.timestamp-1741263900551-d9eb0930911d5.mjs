// docs/.vitepress/config.ts
import { defineConfig } from "file:///D:/VitePress/node_modules/.pnpm/vitepress@1.0.0-alpha.49_@algolia+client-search@4.19.1_@types+node@22.13.9_sass@1.85.1_search-insights@2.17.3/node_modules/vitepress/dist/node/index.js";

// docs/.vitepress/vitepress-plugin-auto-index/index.ts
import { basename, join } from "path";
import { existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "fs";

// docs/.vitepress/vitepress-plugin-auto-index/utils.ts
import c from "file:///D:/VitePress/node_modules/.pnpm/picocolors@1.1.1/node_modules/picocolors/picocolors.js";
import moment from "file:///D:/VitePress/node_modules/.pnpm/moment@2.30.1/node_modules/moment/moment.js";
var DEFAULT_IGNORE_FOLDER = ["public", "scripts", "components", "assets", ".vitepress", "index.md"];
function log(...info) {
  console.log(c.bold(c.cyan("[auto-index]")), ...info);
}
function getTimeStr() {
  return moment().format("YYYYMMDD_kk_mm_ss");
}

// docs/.vitepress/vitepress-plugin-auto-index/index.ts
var option;
function getTitleFromFile(realFileName) {
  if (!existsSync(realFileName)) {
    return void 0;
  }
  const fileExtension = realFileName.substring(
    realFileName.lastIndexOf(".") + 1
  );
  if (fileExtension !== "md" && fileExtension !== "MD") {
    return void 0;
  }
  const data = readFileSync(realFileName, { encoding: "utf-8" });
  const lines = data.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (line.includes("# ")) {
      return line.replace("# ", "");
    }
  }
  return void 0;
}
function renameIndexMd(dir) {
  const files = readdirSync(dir);
  const mdFilesAndFolders = files.filter((f) => {
    const stats = statSync(join(dir, f));
    return !DEFAULT_IGNORE_FOLDER.includes(f) && (f.endsWith(".md") || stats.isDirectory());
  });
  const exculdeFolderMds = mdFilesAndFolders.filter(
    (f) => f !== `${basename(dir)}.md`
  );
  const hasIndexMd = files.includes("index.md");
  const hasFolderMd = files.includes(`${basename(dir)}.md`);
  const hasOtherMd = exculdeFolderMds.length > 0;
  if (hasIndexMd && !hasFolderMd && !hasOtherMd) {
    const folderName = basename(dir);
    const oldPath = join(dir, "index.md");
    const newPath = join(dir, `${folderName}.md`);
    log("\u3010\u4E00\u4E2A\u76EE\u5F55\u4E0B\u53EA\u5305\u542B\u4E00\u7BC7\u6587\u7AE0\u548C\u9644\u4EF6\u3011\u5219\u6587\u4EF6\u540D\u9700\u8981\u548C\u76EE\u5F55\u7684\u540D\u5B57\u4E00\u81F4!");
    log(`rename ${oldPath} -> ${newPath} `);
    renameSync(oldPath, newPath);
  }
  if (hasIndexMd && hasFolderMd && !hasOtherMd) {
    const unlinkPath = join(dir, "index.md");
    const unlinkPathBak = join(dir, `index.md.${getTimeStr()}.del.bak`);
    log(`\u5907\u4EFD ${unlinkPath} -> ${unlinkPathBak} `);
    renameSync(unlinkPath, unlinkPathBak);
    log("\u3010\u4E00\u4E2A\u76EE\u5F55\u4E0B\u53EA\u5305\u542B\u4E00\u7BC7\u6587\u7AE0\u548C\u9644\u4EF6\u3011\u4E0D\u80FD\u589E\u52A0\u989D\u5916\u7684\u7D22\u5F15\u6587\u4EF6\uFF01");
    log(`delete ${unlinkPath}`);
  }
  if (hasIndexMd && hasFolderMd && hasOtherMd) {
    const unlinkPath = join(dir, `${basename(dir)}.md`);
    const unlinkPathBak = join(dir, `${basename(dir)}.md.${getTimeStr()}.del.bak`);
    log(`\u5907\u4EFD ${unlinkPath} -> ${unlinkPathBak} `);
    renameSync(unlinkPath, unlinkPathBak);
    log("\u53EA\u6709\u3010\u4E00\u4E2A\u76EE\u5F55\u4E0B\u53EA\u5305\u542B\u4E00\u7BC7\u6587\u7AE0\u548C\u9644\u4EF6\u3011\u624D\u53EF\u4EE5\u4F7F\u7528\u6587\u4EF6\u5939\u540C\u540Dmd\u547D\u540D\uFF01");
    log(`delete ${unlinkPath}`);
  }
  readdirSync(dir).filter((f) => {
    const stats = statSync(join(dir, f));
    return !DEFAULT_IGNORE_FOLDER.includes(f) && (f.endsWith(".md") || stats.isDirectory());
  }).forEach((file) => {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      renameIndexMd(filePath);
    }
  });
}
var excludedFiles = DEFAULT_IGNORE_FOLDER;
function generateIndex(dir, option2) {
  const { mdFilePath = "docs" } = option2;
  const files1 = readdirSync(dir);
  let s = basename(dir);
  if (s === mdFilePath) {
    s = "\u76EE\u5F55";
  }
  let indexContent = `# ${s}
`;
  let files = files1.sort((a, b) => {
    const statsA = statSync(join(dir, a));
    const statsB = statSync(join(dir, b));
    return statsB.mtimeMs - statsA.mtimeMs;
  });
  const filtered = files.filter((f) => {
    const stats = statSync(join(dir, f));
    return !DEFAULT_IGNORE_FOLDER.includes(f) && (f.endsWith(".md") || stats.isDirectory());
  });
  if (filtered.length === 1) {
    if (filtered[0] === `${basename(dir)}.md`) {
      const indexPath = join(dir, "index.md");
      const existsSync1 = existsSync(indexPath);
      if (existsSync1) {
        const unlinkPathBak = join(dir, `index.md.${getTimeStr()}.del.bak`);
        log(`\u5907\u4EFD ${indexPath} -> ${unlinkPathBak} `);
        renameSync(indexPath, unlinkPathBak);
        log(`delete ${indexPath}`);
        files = files.filter((f) => f !== "index.md");
      }
    } else {
      const indexPath = join(dir, `${basename(dir)}.md`);
      const existsSync1 = existsSync(indexPath);
      if (existsSync1) {
        const unlinkPathBak = join(dir, `${basename(dir)}.md.${getTimeStr()}.del.bak`);
        log(`\u5907\u4EFD ${indexPath} -> ${unlinkPathBak} `);
        renameSync(indexPath, unlinkPathBak);
        log(`delete ${indexPath}`);
        files = files.filter((f) => f !== `${basename(dir)}.md`);
      }
    }
  }
  if (filtered.length > 1 && filtered.includes(`${basename(dir)}.md`)) {
    const indexPath = join(dir, `${basename(dir)}.md`);
    const existsSync1 = existsSync(indexPath);
    if (existsSync1) {
      const unlinkPathBak = join(dir, `${basename(dir)}.md.${getTimeStr()}.del.bak`);
      log(`\u5907\u4EFD ${indexPath} -> ${unlinkPathBak} `);
      renameSync(indexPath, unlinkPathBak);
      log(`delete ${indexPath}`);
      files = files.filter((f) => f !== `${basename(dir)}.md`);
    }
  }
  for (const file of files) {
    if (excludedFiles.includes(file))
      continue;
    const filePath = join(dir, file);
    const stats = statSync(filePath);
    if (stats.isDirectory()) {
      const title1 = getTitleFromFile(join(filePath, "index.md"));
      const title2 = getTitleFromFile(join(filePath, "index.MD"));
      const title3 = getTitleFromFile(join(filePath, file + ".md"));
      let out = file;
      if (title1) {
        out = title1;
      } else if (title2) {
        out = title2;
      } else if (title3) {
        out = title3;
      }
      generateIndex(filePath, option2);
      if (existsSync(join(dir, file, "index.md"))) {
        indexContent += `- [${out}](./${file}/)
`;
      } else if (existsSync(join(dir, file, `${file}.md`))) {
        indexContent += `- [${out}](./${file}/${file}.md)
`;
      }
    } else if (file.endsWith(".md")) {
      const title = getTitleFromFile(filePath);
      let out = file;
      if (title) {
        out = title;
      }
      indexContent += `- [${out}](./${file})
`;
    }
  }
  if (!files.includes(`${basename(dir)}.md`)) {
    if (basename(dir) === "docs") {
      return;
    }
    writeIfDifferent(dir, "index.md", indexContent);
  }
}
function writeIfDifferent(dir, fileName, content) {
  const filePath = join(dir, fileName);
  if (existsSync(filePath)) {
    const existingContent = readFileSync(filePath, "utf8");
    if (existingContent === content) {
      return;
    }
  }
  writeFileSync(filePath, content);
  log(filePath + " \u6587\u4EF6\u5DF2\u5199\u5165");
}
function VitePluginVitePressAutoIndex(opt = {}) {
  return {
    name: "vite-plugin-vitepress-auto-index",
    configureServer({
      watcher,
      restart
    }) {
      option = opt;
      const { mdFilePath = "docs" } = option;
      const fsWatcher = watcher.add(join(process.cwd(), mdFilePath));
      fsWatcher.on("all", async (event) => {
        if (event === "addDir") {
          log("watch addDir ");
          await restart();
          return;
        }
        if (event === "unlinkDir") {
          log("watch unlinkDir");
          await restart();
          return;
        }
        if (event === "add") {
          log("watch add");
          await restart();
          return;
        }
        if (event === "unlink") {
          log("watch unlink");
          await restart();
          return;
        }
        if (event === "change") {
          log("watch change");
          await restart();
        }
      });
    },
    config(config) {
      option = opt;
      const { mdFilePath = "docs" } = option;
      const docsRoot = join(process.cwd(), mdFilePath);
      log("begin rename \u91CD\u547D\u540D");
      renameIndexMd(docsRoot);
      log("finsh rename \u91CD\u547D\u540D");
      generateIndex(docsRoot, option);
      log("index generate finish!");
      return config;
    }
  };
}

// docs/.vitepress/config.ts
import { pagefindPlugin } from "file:///D:/VitePress/node_modules/.pnpm/vitepress-plugin-pagefind@0.2.10/node_modules/vitepress-plugin-pagefind/dist/index.mjs";
import { getThemeConfig } from "file:///D:/VitePress/node_modules/.pnpm/@sugarat+theme@0.5.4_@element-plus+icons-vue@2.3.1_vue@3.3.4__element-plus@2.9.5_vue@3.3.4__p_dyz4uxh6jksdzx5q26h5wyae2u/node_modules/@sugarat/theme/node.mjs";
var blogTheme = getThemeConfig({
  author: "tzf",
  homeTags: true,
  hotArticle: {
    title: "\u{1F525} \u7CBE\u9009\u6587\u7AE0",
    nextText: "\u6362\u4E00\u7EC4",
    pageSize: 12,
    empty: "\u6682\u65E0\u7CBE\u9009\u5185\u5BB9"
  },
  friend: {
    list: [
      {
        nickname: "\u4E03\u4ED4\u7684\u535A\u5BA2",
        des: "\u8BB0\u5F55\u81EA\u5DF1\u5728\u5199\u7A0B\u5E8F\u8FC7\u7A0B\u4E2D\u7684\u53D1\u73B0\u3001\u95EE\u9898\u3001\u6210\u679C",
        url: "https://www.baby7blog.com",
        avatar: "https://www.baby7blog.com/favicon.ico"
      },
      {
        nickname: "\u8302\u8302\u7269\u8BED",
        des: "\u8302\u8302\u7684\u6210\u957F\u4E4B\u8DEF\uFF0C\u5305\u542B\u524D\u7AEF\u5E38\u7528\u77E5\u8BC6\u3001\u6E90\u7801\u9605\u8BFB\u7B14\u8BB0\u3001\u5404\u79CD\u5947\u6DEB\u6280\u5DE7\u3001\u65E5\u5E38\u63D0\u6548\u5DE5\u5177\u7B49",
        url: "https://notes.fe-mm.com",
        avatar: "https://notes.fe-mm.com/logo.png"
      },
      {
        nickname: "\u674E\u5E74\u7CD5",
        des: "\u4F5B\u7CFB\u7684\u6253\u5DE5\u4EBA",
        avatar: "https://cdn.upyun.sugarat.top/mdImg/sugar/617be739258b761b7dfed4fa0869326c",
        url: "https://rimochiko.github.io/"
      },
      {
        nickname: "\u51B4\u7FBD",
        des: "\u51B4\u7FBD\u7684\u535A\u5BA2",
        avatar: "https://cdn.upyun.sugarat.top/avatar/blog/mqyqingfeng.png",
        url: "https://yayujs.com/"
      },
      {
        nickname: "\u5C0F\u4E5D",
        des: "\u65E5\u76CA\u52AA\u529B\uFF0C\u800C\u540E\u98CE\u751F\u6C34\u8D77",
        avatar: "https://cdn.upyun.sugarat.top/avatar/blog/jiangly.png",
        url: "https://jiangly.com/"
      },
      {
        nickname: "\u82B1\u55B5\u7535\u53F0      ",
        des: "\u66F9\u8C6A\u4FA0\u548C\u4F59\u6E7E\u6E7E\u8FD8\u6709\u4E24\u53EA\u732B\u7684\u751F\u6D3B\u8BB0\u5F55~",
        avatar: "https://cdn.upyun.sugarat.top/avatar/blog/fmcat.jpeg",
        url: "https://www.fmcat.top"
      },
      {
        nickname: "\u5F20\u6210\u5A01\u7684\u7F51\u7EDC\u65E5\u5FD7",
        des: "\u77E5\u4E0D\u8DB3\u800C\u594B\u8FDB\uFF0C\u671B\u8FDC\u5C71\u800C\u524D\u884C",
        avatar: "https://cdn.upyun.sugarat.top/avatar/blog/zhangchengwei.png",
        url: "https://www.zhangchengwei.work"
      },
      {
        url: "https://leelaa.cn",
        avatar: "https://cdn.upyun.sugarat.top/avatar/blog/leelaa.png",
        des: "\u80AF\u4E86\u4E2A\u5FB7\u7684\u535A\u5BA2",
        nickname: "LEEDAISEN"
      },
      {
        url: "https://next.blackcell.fun/",
        avatar: "https://cdn.upyun.sugarat.top/avatar/blog/blackcell.jpeg",
        des: "\u7269\u4EE5\u7C7B\u805A \u4EBA\u4EE5\u7FA4\u5206",
        nickname: "BlackCell"
      },
      {
        url: "https://tenyon.cn",
        avatar: "https://cdn.upyun.sugarat.top/avatar/blog/tenyon.webp",
        des: "\u5DE5\u592B\u4E3A\u827A\uFF0C\u7B03\u5FD7\u6210\u6280",
        nickname: "Yovvis's Blog"
      },
      {
        nickname: "\u5F3A\u5C11\u6765\u4E86",
        des: "\u4E92\u8054\u7F51\u4EA7\u54C1\u7ECF\u7406",
        avatar: "https://cdn.upyun.sugarat.top/avatar/blog/fengxiaoqiang.png",
        url: "https://fengxiaoqiang.com/"
      },
      {
        nickname: "\u535A\u53CB\u5708",
        des: "\u72EC\u7ACB\u535A\u5BA2\u4EBA\u7684\u4E13\u5C5E\u670B\u53CB\u5708\uFF01",
        avatar: "https://cdn.upyun.sugarat.top/mdImg/sugar/bdee5d11a1e036ca3634943d34469f59",
        url: "https://www.boyouquan.com/home"
      },
      {
        nickname: "Simon He",
        des: "\u9664\u4E86coding\uFF0C\u6211\u4EC0\u4E48\u90FD\u4E0D\u4F1A",
        avatar: "https://cdn.upyun.sugarat.top/avatar/blog/simonme.png",
        url: "https://simonme.netlify.app/"
      },
      {
        nickname: "laiky",
        des: "\u4E00\u540D\u5168\u6808\u5F00\u53D1\u5DE5\u7A0B\u5E08\uFF0C.NET\u5168\u6808\u7ECF\u9A8C",
        avatar: "https://cdn.upyun.sugarat.top/avatar/blog/llxz.png",
        url: "http://llxz.top/"
      },
      {
        nickname: "\u83DC\u56ED\u524D\u7AEF",
        des: "\u5C0F\u767D\u90FD\u80FD\u770B\u61C2\u7684\u7B14\u8BB0",
        avatar: "https://note.noxussj.top/logo.png",
        url: "https://note.noxussj.top/?s=y8"
      },
      {
        nickname: "Hacxy Blog",
        des: "\u6307\u5C16\u6539\u53D8\u547D\u8FD0\u{1F60B}",
        avatar: "https://hacxy.cn/logo.png",
        url: "https://hacxy.cn"
      }
    ].map((v) => {
      if (v.avatar.includes("//cdn.upyun.sugarat.top")) {
        v.avatar = `${v.avatar}-wh50`;
      }
      return v;
    }),
    random: true,
    limit: 6
  },
  search: {
    showDate: true,
    pageResultCount: 4
  },
  recommend: {
    showSelf: true,
    nextText: "\u4E0B\u4E00\u9875",
    style: "sidebar"
  }
});
var config_default = defineConfig({
  // 继承博客主题配置 //
  extends: blogTheme,
  // 插件 //
  title: "\u8BB0\u5F55bug blog",
  description: "A VitePress Site",
  lastUpdated: true,
  markdown: {
    lineNumbers: true
    //md 加行号
  },
  themeConfig: {
    aside: true,
    // outline设置为deep可以解析2-6层深度的标题嵌套
    outline: "deep",
    outlineBadges: true,
    lastUpdatedText: "\u66F4\u65B0\u65F6\u95F4",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      //右侧头部导航
      { text: "\u4E3B\u9875", link: "/" },
      { text: "JavaScript", link: "/01.JavaScript/index" },
      { text: "NodeJs", link: "/02.NodeJs/index" },
      { text: "Python", link: "/03.Python/index" },
      { text: "Git", link: "/04.Git/index" },
      { text: "Vue", link: "/05.Vue/index" },
      { text: "CSS", link: "/06.CSS/index" },
      { text: "Angular", link: "/07.Angular/index" },
      { text: "React", link: "/08.React/index" },
      { text: "\u7B14\u8BB0", link: "/note/index" }
    ],
    socialLinks: [
      //右上角图标和链接，icon 可用svg 配置
      { icon: "github", link: "https://github.com/767560479" },
      { icon: "linkedin", link: "https://www.notion.so/tanzf/" }
    ]
  },
  vite: {
    plugins: [
      // AutoSidebar({ ignoreList: ['public'], createIndex: true }),
      {
        ...VitePluginVitePressAutoIndex({}),
        enforce: "pre"
      },
      pagefindPlugin()
    ]
  }
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiZG9jcy8udml0ZXByZXNzL2NvbmZpZy50cyIsICJkb2NzLy52aXRlcHJlc3Mvdml0ZXByZXNzLXBsdWdpbi1hdXRvLWluZGV4L2luZGV4LnRzIiwgImRvY3MvLnZpdGVwcmVzcy92aXRlcHJlc3MtcGx1Z2luLWF1dG8taW5kZXgvdXRpbHMudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxWaXRlUHJlc3NcXFxcZG9jc1xcXFwudml0ZXByZXNzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxWaXRlUHJlc3NcXFxcZG9jc1xcXFwudml0ZXByZXNzXFxcXGNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovVml0ZVByZXNzL2RvY3MvLnZpdGVwcmVzcy9jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlcHJlc3MnXG5pbXBvcnQgQXV0b0luZGV4IGZyb20gJy4vdml0ZXByZXNzLXBsdWdpbi1hdXRvLWluZGV4L2luZGV4J1xuaW1wb3J0IEF1dG9TaWRlYmFyIGZyb20gJ3ZpdGUtcGx1Z2luLXZpdGVwcmVzcy1hdXRvLXNpZGViYXInXG5pbXBvcnQgeyBwYWdlZmluZFBsdWdpbiB9IGZyb20gJ3ZpdGVwcmVzcy1wbHVnaW4tcGFnZWZpbmQnXG4vLyBcdTVCRkNcdTUxNjVcdTc1MUZcdTYyMTBcdTkxNERcdTdGNkVcdTVERTVcdTUxNzdcdTY1QjlcdTZDRDUgLy9cbmltcG9ydCB7IGdldFRoZW1lQ29uZmlnIH0gZnJvbSAnQHN1Z2FyYXQvdGhlbWUvbm9kZSdcbi8vIFx1NEUzQlx1OTg5OFx1NzJFQ1x1NjcwOVx1OTE0RFx1N0Y2RVx1RkYwQ1x1NjI0MFx1NjcwOVx1OTE0RFx1N0Y2RVx1OTg3OVx1RkYwQ1x1OEJFNlx1ODlDMVx1NjU4N1x1Njg2MzogaHR0cHM6Ly90aGVtZS5zdWdhcmF0LnRvcC8gLy9cbmNvbnN0IGJsb2dUaGVtZSA9IGdldFRoZW1lQ29uZmlnKHtcbiAgYXV0aG9yOiAndHpmJyxcbiAgaG9tZVRhZ3M6IHRydWUsXG4gIGhvdEFydGljbGU6IHtcbiAgICB0aXRsZTogJ1x1RDgzRFx1REQyNSBcdTdDQkVcdTkwMDlcdTY1ODdcdTdBRTAnLFxuICAgIG5leHRUZXh0OiAnXHU2MzYyXHU0RTAwXHU3RUM0JyxcbiAgICBwYWdlU2l6ZTogMTIsXG4gICAgZW1wdHk6ICdcdTY2ODJcdTY1RTBcdTdDQkVcdTkwMDlcdTUxODVcdTVCQjknLFxuICB9LFxuICBmcmllbmQ6IHtcbiAgICBsaXN0OiBbXG4gICAgICB7XG4gICAgICAgIG5pY2tuYW1lOiAnXHU0RTAzXHU0RUQ0XHU3Njg0XHU1MzVBXHU1QkEyJyxcbiAgICAgICAgZGVzOiAnXHU4QkIwXHU1RjU1XHU4MUVBXHU1REYxXHU1NzI4XHU1MTk5XHU3QTBCXHU1RThGXHU4RkM3XHU3QTBCXHU0RTJEXHU3Njg0XHU1M0QxXHU3M0IwXHUzMDAxXHU5NUVFXHU5ODk4XHUzMDAxXHU2MjEwXHU2NzlDJyxcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly93d3cuYmFieTdibG9nLmNvbScsXG4gICAgICAgIGF2YXRhcjogJ2h0dHBzOi8vd3d3LmJhYnk3YmxvZy5jb20vZmF2aWNvbi5pY28nLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmlja25hbWU6ICdcdTgzMDJcdTgzMDJcdTcyNjlcdThCRUQnLFxuICAgICAgICBkZXM6ICdcdTgzMDJcdTgzMDJcdTc2ODRcdTYyMTBcdTk1N0ZcdTRFNEJcdThERUZcdUZGMENcdTUzMDVcdTU0MkJcdTUyNERcdTdBRUZcdTVFMzhcdTc1MjhcdTc3RTVcdThCQzZcdTMwMDFcdTZFOTBcdTc4MDFcdTk2MDVcdThCRkJcdTdCMTRcdThCQjBcdTMwMDFcdTU0MDRcdTc5Q0RcdTU5NDdcdTZERUJcdTYyODBcdTVERTdcdTMwMDFcdTY1RTVcdTVFMzhcdTYzRDBcdTY1NDhcdTVERTVcdTUxNzdcdTdCNDknLFxuICAgICAgICB1cmw6ICdodHRwczovL25vdGVzLmZlLW1tLmNvbScsXG4gICAgICAgIGF2YXRhcjogJ2h0dHBzOi8vbm90ZXMuZmUtbW0uY29tL2xvZ28ucG5nJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5pY2tuYW1lOiAnXHU2NzRFXHU1RTc0XHU3Q0Q1JyxcbiAgICAgICAgZGVzOiAnXHU0RjVCXHU3Q0ZCXHU3Njg0XHU2MjUzXHU1REU1XHU0RUJBJyxcbiAgICAgICAgYXZhdGFyOiAnaHR0cHM6Ly9jZG4udXB5dW4uc3VnYXJhdC50b3AvbWRJbWcvc3VnYXIvNjE3YmU3MzkyNThiNzYxYjdkZmVkNGZhMDg2OTMyNmMnLFxuICAgICAgICB1cmw6ICdodHRwczovL3JpbW9jaGlrby5naXRodWIuaW8vJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5pY2tuYW1lOiAnXHU1MUI0XHU3RkJEJyxcbiAgICAgICAgZGVzOiAnXHU1MUI0XHU3RkJEXHU3Njg0XHU1MzVBXHU1QkEyJyxcbiAgICAgICAgYXZhdGFyOiAnaHR0cHM6Ly9jZG4udXB5dW4uc3VnYXJhdC50b3AvYXZhdGFyL2Jsb2cvbXF5cWluZ2ZlbmcucG5nJyxcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly95YXl1anMuY29tLycsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuaWNrbmFtZTogJ1x1NUMwRlx1NEU1RCcsXG4gICAgICAgIGRlczogJ1x1NjVFNVx1NzZDQVx1NTJBQVx1NTI5Qlx1RkYwQ1x1ODAwQ1x1NTQwRVx1OThDRVx1NzUxRlx1NkMzNFx1OEQ3NycsXG4gICAgICAgIGF2YXRhcjogJ2h0dHBzOi8vY2RuLnVweXVuLnN1Z2FyYXQudG9wL2F2YXRhci9ibG9nL2ppYW5nbHkucG5nJyxcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly9qaWFuZ2x5LmNvbS8nLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmlja25hbWU6ICdcdTgyQjFcdTU1QjVcdTc1MzVcdTUzRjAgICAgICAnLFxuICAgICAgICBkZXM6ICdcdTY2RjlcdThDNkFcdTRGQTBcdTU0OENcdTRGNTlcdTZFN0VcdTZFN0VcdThGRDhcdTY3MDlcdTRFMjRcdTUzRUFcdTczMkJcdTc2ODRcdTc1MUZcdTZEM0JcdThCQjBcdTVGNTV+JyxcbiAgICAgICAgYXZhdGFyOiAnaHR0cHM6Ly9jZG4udXB5dW4uc3VnYXJhdC50b3AvYXZhdGFyL2Jsb2cvZm1jYXQuanBlZycsXG4gICAgICAgIHVybDogJ2h0dHBzOi8vd3d3LmZtY2F0LnRvcCcsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuaWNrbmFtZTogJ1x1NUYyMFx1NjIxMFx1NUEwMVx1NzY4NFx1N0Y1MVx1N0VEQ1x1NjVFNVx1NUZENycsXG4gICAgICAgIGRlczogJ1x1NzdFNVx1NEUwRFx1OERCM1x1ODAwQ1x1NTk0Qlx1OEZEQlx1RkYwQ1x1NjcxQlx1OEZEQ1x1NUM3MVx1ODAwQ1x1NTI0RFx1ODg0QycsXG4gICAgICAgIGF2YXRhcjogJ2h0dHBzOi8vY2RuLnVweXVuLnN1Z2FyYXQudG9wL2F2YXRhci9ibG9nL3poYW5nY2hlbmd3ZWkucG5nJyxcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly93d3cuemhhbmdjaGVuZ3dlaS53b3JrJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHVybDogJ2h0dHBzOi8vbGVlbGFhLmNuJyxcbiAgICAgICAgYXZhdGFyOiAnaHR0cHM6Ly9jZG4udXB5dW4uc3VnYXJhdC50b3AvYXZhdGFyL2Jsb2cvbGVlbGFhLnBuZycsXG4gICAgICAgIGRlczogJ1x1ODBBRlx1NEU4Nlx1NEUyQVx1NUZCN1x1NzY4NFx1NTM1QVx1NUJBMicsXG4gICAgICAgIG5pY2tuYW1lOiAnTEVFREFJU0VOJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHVybDogJ2h0dHBzOi8vbmV4dC5ibGFja2NlbGwuZnVuLycsXG4gICAgICAgIGF2YXRhcjogJ2h0dHBzOi8vY2RuLnVweXVuLnN1Z2FyYXQudG9wL2F2YXRhci9ibG9nL2JsYWNrY2VsbC5qcGVnJyxcbiAgICAgICAgZGVzOiAnXHU3MjY5XHU0RUU1XHU3QzdCXHU4MDVBIFx1NEVCQVx1NEVFNVx1N0ZBNFx1NTIwNicsXG4gICAgICAgIG5pY2tuYW1lOiAnQmxhY2tDZWxsJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHVybDogJ2h0dHBzOi8vdGVueW9uLmNuJyxcbiAgICAgICAgYXZhdGFyOiAnaHR0cHM6Ly9jZG4udXB5dW4uc3VnYXJhdC50b3AvYXZhdGFyL2Jsb2cvdGVueW9uLndlYnAnLFxuICAgICAgICBkZXM6ICdcdTVERTVcdTU5MkJcdTRFM0FcdTgyN0FcdUZGMENcdTdCMDNcdTVGRDdcdTYyMTBcdTYyODAnLFxuICAgICAgICBuaWNrbmFtZTogXCJZb3Z2aXMncyBCbG9nXCIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuaWNrbmFtZTogJ1x1NUYzQVx1NUMxMVx1Njc2NVx1NEU4NicsXG4gICAgICAgIGRlczogJ1x1NEU5Mlx1ODA1NFx1N0Y1MVx1NEVBN1x1NTRDMVx1N0VDRlx1NzQwNicsXG4gICAgICAgIGF2YXRhcjogJ2h0dHBzOi8vY2RuLnVweXVuLnN1Z2FyYXQudG9wL2F2YXRhci9ibG9nL2Zlbmd4aWFvcWlhbmcucG5nJyxcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly9mZW5neGlhb3FpYW5nLmNvbS8nLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmlja25hbWU6ICdcdTUzNUFcdTUzQ0JcdTU3MDgnLFxuICAgICAgICBkZXM6ICdcdTcyRUNcdTdBQ0JcdTUzNUFcdTVCQTJcdTRFQkFcdTc2ODRcdTRFMTNcdTVDNUVcdTY3MEJcdTUzQ0JcdTU3MDhcdUZGMDEnLFxuICAgICAgICBhdmF0YXI6ICdodHRwczovL2Nkbi51cHl1bi5zdWdhcmF0LnRvcC9tZEltZy9zdWdhci9iZGVlNWQxMWExZTAzNmNhMzYzNDk0M2QzNDQ2OWY1OScsXG4gICAgICAgIHVybDogJ2h0dHBzOi8vd3d3LmJveW91cXVhbi5jb20vaG9tZScsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuaWNrbmFtZTogJ1NpbW9uIEhlJyxcbiAgICAgICAgZGVzOiAnXHU5NjY0XHU0RTg2Y29kaW5nXHVGRjBDXHU2MjExXHU0RUMwXHU0RTQ4XHU5MEZEXHU0RTBEXHU0RjFBJyxcbiAgICAgICAgYXZhdGFyOiAnaHR0cHM6Ly9jZG4udXB5dW4uc3VnYXJhdC50b3AvYXZhdGFyL2Jsb2cvc2ltb25tZS5wbmcnLFxuICAgICAgICB1cmw6ICdodHRwczovL3NpbW9ubWUubmV0bGlmeS5hcHAvJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5pY2tuYW1lOiAnbGFpa3knLFxuICAgICAgICBkZXM6ICdcdTRFMDBcdTU0MERcdTUxNjhcdTY4MDhcdTVGMDBcdTUzRDFcdTVERTVcdTdBMEJcdTVFMDhcdUZGMEMuTkVUXHU1MTY4XHU2ODA4XHU3RUNGXHU5QThDJyxcbiAgICAgICAgYXZhdGFyOiAnaHR0cHM6Ly9jZG4udXB5dW4uc3VnYXJhdC50b3AvYXZhdGFyL2Jsb2cvbGx4ei5wbmcnLFxuICAgICAgICB1cmw6ICdodHRwOi8vbGx4ei50b3AvJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5pY2tuYW1lOiAnXHU4M0RDXHU1NkVEXHU1MjREXHU3QUVGJyxcbiAgICAgICAgZGVzOiAnXHU1QzBGXHU3NjdEXHU5MEZEXHU4MEZEXHU3NzBCXHU2MUMyXHU3Njg0XHU3QjE0XHU4QkIwJyxcbiAgICAgICAgYXZhdGFyOiAnaHR0cHM6Ly9ub3RlLm5veHVzc2oudG9wL2xvZ28ucG5nJyxcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly9ub3RlLm5veHVzc2oudG9wLz9zPXk4JyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5pY2tuYW1lOiAnSGFjeHkgQmxvZycsXG4gICAgICAgIGRlczogJ1x1NjMwN1x1NUMxNlx1NjUzOVx1NTNEOFx1NTQ3RFx1OEZEMFx1RDgzRFx1REUwQicsXG4gICAgICAgIGF2YXRhcjogJ2h0dHBzOi8vaGFjeHkuY24vbG9nby5wbmcnLFxuICAgICAgICB1cmw6ICdodHRwczovL2hhY3h5LmNuJyxcbiAgICAgIH0sXG4gICAgXS5tYXAodiA9PiB7XG4gICAgICBpZiAodi5hdmF0YXIuaW5jbHVkZXMoJy8vY2RuLnVweXVuLnN1Z2FyYXQudG9wJykpIHtcbiAgICAgICAgdi5hdmF0YXIgPSBgJHt2LmF2YXRhcn0td2g1MGBcbiAgICAgIH1cbiAgICAgIHJldHVybiB2XG4gICAgfSksXG4gICAgcmFuZG9tOiB0cnVlLFxuICAgIGxpbWl0OiA2LFxuICB9LFxuICBzZWFyY2g6IHtcbiAgICBzaG93RGF0ZTogdHJ1ZSxcbiAgICBwYWdlUmVzdWx0Q291bnQ6IDQsXG4gIH0sXG4gIHJlY29tbWVuZDoge1xuICAgIHNob3dTZWxmOiB0cnVlLFxuICAgIG5leHRUZXh0OiAnXHU0RTBCXHU0RTAwXHU5ODc1JyxcbiAgICBzdHlsZTogJ3NpZGViYXInXG4gIH0sXG59KVxuXG4vLyBodHRwczovL3ZpdGVwcmVzcy5kZXYvcmVmZXJlbmNlL3NpdGUtY29uZmlnXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAvLyBcdTdFRTdcdTYyN0ZcdTUzNUFcdTVCQTJcdTRFM0JcdTk4OThcdTkxNERcdTdGNkUgLy9cbiAgZXh0ZW5kczogYmxvZ1RoZW1lLCAvLyBcdTYzRDJcdTRFRjYgLy9cbiAgdGl0bGU6ICdcdThCQjBcdTVGNTVidWcgYmxvZycsXG4gIGRlc2NyaXB0aW9uOiAnQSBWaXRlUHJlc3MgU2l0ZScsXG4gIGxhc3RVcGRhdGVkOiB0cnVlLFxuICBtYXJrZG93bjoge1xuICAgIGxpbmVOdW1iZXJzOiB0cnVlLCAvL21kIFx1NTJBMFx1ODg0Q1x1NTNGN1xuICB9LFxuICB0aGVtZUNvbmZpZzoge1xuICAgIGFzaWRlOiB0cnVlLFxuICAgIC8vIG91dGxpbmVcdThCQkVcdTdGNkVcdTRFM0FkZWVwXHU1M0VGXHU0RUU1XHU4OUUzXHU2NzkwMi02XHU1QzQyXHU2REYxXHU1RUE2XHU3Njg0XHU2ODA3XHU5ODk4XHU1RDRDXHU1OTU3XG4gICAgb3V0bGluZTogJ2RlZXAnLFxuICAgIG91dGxpbmVCYWRnZXM6IHRydWUsXG4gICAgbGFzdFVwZGF0ZWRUZXh0OiAnXHU2NkY0XHU2NUIwXHU2NUY2XHU5NUY0JyxcbiAgICAvLyBodHRwczovL3ZpdGVwcmVzcy5kZXYvcmVmZXJlbmNlL2RlZmF1bHQtdGhlbWUtY29uZmlnXG4gICAgbmF2OiBbXG4gICAgICAvL1x1NTNGM1x1NEZBN1x1NTkzNFx1OTBFOFx1NUJGQ1x1ODIyQVxuICAgICAgeyB0ZXh0OiAnXHU0RTNCXHU5ODc1JywgbGluazogJy8nIH0sXG4gICAgICB7IHRleHQ6ICdKYXZhU2NyaXB0JywgbGluazogJy8wMS5KYXZhU2NyaXB0L2luZGV4JyB9LFxuICAgICAgeyB0ZXh0OiAnTm9kZUpzJywgbGluazogJy8wMi5Ob2RlSnMvaW5kZXgnIH0sXG4gICAgICB7IHRleHQ6ICdQeXRob24nLCBsaW5rOiAnLzAzLlB5dGhvbi9pbmRleCcgfSxcbiAgICAgIHsgdGV4dDogJ0dpdCcsIGxpbms6ICcvMDQuR2l0L2luZGV4JyB9LFxuICAgICAgeyB0ZXh0OiAnVnVlJywgbGluazogJy8wNS5WdWUvaW5kZXgnIH0sXG4gICAgICB7IHRleHQ6ICdDU1MnLCBsaW5rOiAnLzA2LkNTUy9pbmRleCcgfSxcbiAgICAgIHsgdGV4dDogJ0FuZ3VsYXInLCBsaW5rOiAnLzA3LkFuZ3VsYXIvaW5kZXgnIH0sXG4gICAgICB7IHRleHQ6ICdSZWFjdCcsIGxpbms6ICcvMDguUmVhY3QvaW5kZXgnIH0sXG4gICAgICB7IHRleHQ6ICdcdTdCMTRcdThCQjAnLCBsaW5rOiAnL25vdGUvaW5kZXgnIH0sXG4gICAgXSxcblxuICAgIHNvY2lhbExpbmtzOiBbXG4gICAgICAvL1x1NTNGM1x1NEUwQVx1ODlEMlx1NTZGRVx1NjgwN1x1NTQ4Q1x1OTRGRVx1NjNBNVx1RkYwQ2ljb24gXHU1M0VGXHU3NTI4c3ZnIFx1OTE0RFx1N0Y2RVxuICAgICAgeyBpY29uOiAnZ2l0aHViJywgbGluazogJ2h0dHBzOi8vZ2l0aHViLmNvbS83Njc1NjA0NzknIH0sXG4gICAgICB7IGljb246ICdsaW5rZWRpbicsIGxpbms6ICdodHRwczovL3d3dy5ub3Rpb24uc28vdGFuemYvJyB9LFxuICAgIF0sXG4gIH0sXG4gIHZpdGU6IHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICAvLyBBdXRvU2lkZWJhcih7IGlnbm9yZUxpc3Q6IFsncHVibGljJ10sIGNyZWF0ZUluZGV4OiB0cnVlIH0pLFxuICAgICAge1xuICAgICAgICAuLi5BdXRvSW5kZXgoe30pLFxuICAgICAgICBlbmZvcmNlOiAncHJlJyxcbiAgICAgIH0sXG4gICAgICBwYWdlZmluZFBsdWdpbigpLFxuICAgIF0sXG4gIH0sXG59KVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxWaXRlUHJlc3NcXFxcZG9jc1xcXFwudml0ZXByZXNzXFxcXHZpdGVwcmVzcy1wbHVnaW4tYXV0by1pbmRleFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcVml0ZVByZXNzXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFx2aXRlcHJlc3MtcGx1Z2luLWF1dG8taW5kZXhcXFxcaW5kZXgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1ZpdGVQcmVzcy9kb2NzLy52aXRlcHJlc3Mvdml0ZXByZXNzLXBsdWdpbi1hdXRvLWluZGV4L2luZGV4LnRzXCI7LypcclxuICogQERlc2NyaXB0aW9uOlxyXG4gKiBAQXV0aG9yOiB6aGVuZ2ZlaS50YW5cclxuICogQERhdGU6IDIwMjUtMDMtMDYgMTc6MjI6MzZcclxuICogQEZpbGVQYXRoOiBcXFZpdGVQcmVzc1xcZG9jc1xcLnZpdGVwcmVzc1xcdml0ZXByZXNzLXBsdWdpbi1hdXRvLWluZGV4XFxpbmRleC50c1xyXG4gKi9cclxuaW1wb3J0IHsgYmFzZW5hbWUsIGpvaW4gfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZGRpclN5bmMsIHJlYWRGaWxlU3luYywgcmVuYW1lU3luYywgc3RhdFN5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tICdmcyc7XHJcbmltcG9ydCB7IHR5cGUgUGx1Z2luLCB0eXBlIFZpdGVEZXZTZXJ2ZXIgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHR5cGUgeyBJbmRleFBsdWdpbk9wdGlvblR5cGUgfSBmcm9tICcuL3R5cGVzJztcclxuXHJcbmltcG9ydCB7IERFRkFVTFRfSUdOT1JFX0ZPTERFUiwgZ2V0VGltZVN0ciwgbG9nIH0gZnJvbSAnLi91dGlscyc7XHJcblxyXG5sZXQgb3B0aW9uOiBJbmRleFBsdWdpbk9wdGlvblR5cGU7XHJcblxyXG4vLyBcdTVDMURcdThCRDVcdTRFQ0VcdTRFMDBcdTRFMkFtZFx1NjU4N1x1NEVGNlx1NEUyRFx1OEJGQlx1NTNENlx1NjgwN1x1OTg5OFx1RkYwQ1x1OEJGQlx1NTNENlx1NTIzMFx1N0IyQ1x1NEUwMFx1NEUyQSBcdTIwMTgjIFx1NjgwN1x1OTg5OFx1NTE4NVx1NUJCOVx1MjAxOSBcdTc2ODRcdTY1RjZcdTUwMTlcdThGRDRcdTU2REVcdThGRDlcdTRFMDBcdTg4NENcclxuZnVuY3Rpb24gZ2V0VGl0bGVGcm9tRmlsZSAocmVhbEZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gIGlmICghZXhpc3RzU3luYyhyZWFsRmlsZU5hbWUpKSB7XHJcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gIH1cclxuICBjb25zdCBmaWxlRXh0ZW5zaW9uID0gcmVhbEZpbGVOYW1lLnN1YnN0cmluZyhcclxuICAgIHJlYWxGaWxlTmFtZS5sYXN0SW5kZXhPZignLicpICsgMVxyXG4gICk7XHJcbiAgaWYgKGZpbGVFeHRlbnNpb24gIT09ICdtZCcgJiYgZmlsZUV4dGVuc2lvbiAhPT0gJ01EJykge1xyXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICB9XHJcbiAgLy8gcmVhZCBjb250ZW50cyBvZiB0aGUgZmlsZVxyXG4gIGNvbnN0IGRhdGEgPSByZWFkRmlsZVN5bmMocmVhbEZpbGVOYW1lLCB7IGVuY29kaW5nOiAndXRmLTgnIH0pO1xyXG4gIC8vIHNwbGl0IHRoZSBjb250ZW50cyBieSBuZXcgbGluZVxyXG4gIGNvbnN0IGxpbmVzID0gZGF0YS5zcGxpdCgvXFxyP1xcbi8pO1xyXG4gIC8vIHByaW50IGFsbCBsaW5lc1xyXG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBsaW5lcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgIGNvbnN0IGxpbmUgPSBsaW5lc1tpbmRleF07XHJcbiAgICBpZiAobGluZS5pbmNsdWRlcygnIyAnKSkge1xyXG4gICAgICByZXR1cm4gbGluZS5yZXBsYWNlKCcjICcsICcnKTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHVuZGVmaW5lZDtcclxufVxyXG5cclxuLyogXHU3NTI4XHU0RThFXHU1OTA0XHU3NDA2XHU2NTg3XHU0RUY2XHU1NDdEXHU1NDBEXHU1MUIyXHU3QTgxXHVGRjBDXHU5MDdGXHU1MTREXHU2NTg3XHU0RUY2XHU1OTM5XHU1MUZBXHU3M0IwXHU1MzlGXHU1OUNCXHU3Njg0aW5kZXgubWRcdTY1ODdcdTRFRjZcdTg4QUJcdTg5ODZcdTc2RDZcdTc2ODRcdTk1RUVcdTk4OThcclxuXHU2NTg3XHU0RUY2XHU1OTM5XHU1NDBEXHU3OUYwXHU0RTNBbXliYXRpc1x1NEUwQlx1OTc2Mlx1NTFFMFx1NzlDRFx1NjBDNVx1NTFCNVx1NTk4Mlx1NEY1NVx1NTkwNFx1NzQwNlxyXG4xLiBteWJhdGlzLm1kICBcdTZFRTFcdThEQjNcdTUzNTVcdTY1ODdcdTRFRjZcdTVFMjZcdTk2NDRcdTRFRjZcdTc2ODRcdTY1ODdcdTdBRTBcdTcyNzlcdTcwQjlcdUZGMENcdTk3MDBcdTg5ODFcdTRGRERcdThCQzFcdThGRDlcdTRFMkFcdTY1ODdcdTRFRjZcdTU5MzlcdTRFMEJcdTk3NjJcdTUzRUFcdTY3MDlcdTRFMDBcdTRFMkFtZFx1RkYwQ1x1NUU3Nlx1NEUxNFx1NTQ4Q1x1NzZFRVx1NUY1NVx1NTQwRFx1NEUwMFx1ODFGNFx1RkYwQ1x1NEUwRFx1NTA1QVx1NTkwNFx1NzQwNlxyXG4yLiBteWJhdGlzLm1kIGluZGV4Lm1kIFx1OEZEOVx1NEUyQVx1NjBDNVx1NTFCNVx1NEUwQlx1OTcwMFx1ODk4MVx1NTIyMFx1OTY2NGluZGV4Lm1kIFx1NzZFRVx1NUY1NVx1NEUwQlx1NTNFQVx1NjcwOVx1NEUwMFx1N0JDN1x1NjU4N1x1N0FFMFx1NEUwRFx1ODk4MVx1N0QyMlx1NUYxNVx1NjU4N1x1NEVGNlx1RkYwQ1x1NUU3Nlx1NzUxRlx1NjIxMFx1NTkwN1x1NEVGRFx1NjU4N1x1NEVGNlxyXG4zLiBteWJhdGlzLm1kIGluZGV4Lm1kIGhhaGEubWQgXHU4RkQ5XHU0RTJBXHU2MEM1XHU1MUI1XHU0RTBCXHU5NzAwXHU4OTgxXHU1MjIwXHU5NjY0bXliYXRpcy5tZCBcdTRFMERcdTg5ODFcdTU0OENcdTc2RUVcdTVGNTVcdTU0MERcdTc5RjBcdTRFMDBcdTgxRjRcdUZGMENcdTVFNzZcdTc1MUZcdTYyMTBcdTU5MDdcdTRFRkRcdTY1ODdcdTRFRjZcclxuNC4gaGFoYS5tZCAgXHU1OTgyXHU2NzlDXHU0RTRCXHU1MjREXHU2Q0ExXHU2NzA5XHU1QzMxXHU2NUIwXHU1RUZBaW5kZXgubWRcdUZGMENcdTU5ODJcdTY3OUNcdTUxODVcdTVCQjlcdTU0OENcdTc1MUZcdTYyMTBcdTRFMERcdTRFMDBcdTgxRjRcdTVDMzFcdTg5ODZcdTc2RDZcdTYzODlcclxuNS4gaW5kZXgubWQgXHU5NzAwXHU4OTgxXHU5MUNEXHU1NDdEXHU1NDBEXHU2MjEwXHU0RTNBIG15YmFpdHMubWQgIFx1NTZFMFx1NEUzQVx1OEZEOVx1NEUyQVx1NjYyRlx1NEUwMFx1N0JDN1x1NjU4N1x1N0FFMCBcdTRFMERcdTk3MDBcdTg5ODFcdTdEMjJcdTVGMTUgKi9cclxuZnVuY3Rpb24gcmVuYW1lSW5kZXhNZCAoZGlyOiBzdHJpbmcpOiB2b2lkIHtcclxuICBjb25zdCBmaWxlcyA9IHJlYWRkaXJTeW5jKGRpcik7XHJcbiAgLy8gXHU3RURGXHU4QkExXHU1RjUzXHU1MjREXHU2NTg3XHU0RUY2XHU1OTM5XHU0RTBCLm1kXHU2NTg3XHU0RUY2XHU2NTcwXHU5MUNGXHJcbiAgY29uc3QgbWRGaWxlc0FuZEZvbGRlcnMgPSBmaWxlcy5maWx0ZXIoZiA9PiB7XHJcbiAgICBjb25zdCBzdGF0cyA9IHN0YXRTeW5jKGpvaW4oZGlyLCBmKSk7XHJcbiAgICByZXR1cm4gIURFRkFVTFRfSUdOT1JFX0ZPTERFUi5pbmNsdWRlcyhmKSAmJlxyXG4gICAgICAoZi5lbmRzV2l0aCgnLm1kJykgfHwgc3RhdHMuaXNEaXJlY3RvcnkoKSk7XHJcbiAgfSk7XHJcbiAgY29uc3QgZXhjdWxkZUZvbGRlck1kcyA9IG1kRmlsZXNBbmRGb2xkZXJzLmZpbHRlcihcclxuICAgIGYgPT4gZiAhPT0gYCR7YmFzZW5hbWUoZGlyKX0ubWRgXHJcbiAgKTtcclxuICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTUzRUFcdTY3MDlcdTRFMDBcdTRFMkFpbmRleC5tZFxyXG4gIGNvbnN0IGhhc0luZGV4TWQgPSBmaWxlcy5pbmNsdWRlcygnaW5kZXgubWQnKTtcclxuICBjb25zdCBoYXNGb2xkZXJNZCA9IGZpbGVzLmluY2x1ZGVzKGAke2Jhc2VuYW1lKGRpcil9Lm1kYCk7XHJcbiAgY29uc3QgaGFzT3RoZXJNZCA9IGV4Y3VsZGVGb2xkZXJNZHMubGVuZ3RoID4gMDtcclxuICBpZiAoaGFzSW5kZXhNZCAmJiAhaGFzRm9sZGVyTWQgJiYgIWhhc090aGVyTWQpIHtcclxuICAgIC8vIFx1NUM1RVx1NEU4RVx1NjcwOVx1NEUxNFx1NTNFQVx1NjcwOVx1NEUwMFx1NEUyQWluZGV4Lm1kXHJcbiAgICBjb25zdCBmb2xkZXJOYW1lID0gYmFzZW5hbWUoZGlyKTtcclxuICAgIGNvbnN0IG9sZFBhdGggPSBqb2luKGRpciwgJ2luZGV4Lm1kJyk7XHJcbiAgICBjb25zdCBuZXdQYXRoID0gam9pbihkaXIsIGAke2ZvbGRlck5hbWV9Lm1kYCk7XHJcbiAgICBsb2coJ1x1MzAxMFx1NEUwMFx1NEUyQVx1NzZFRVx1NUY1NVx1NEUwQlx1NTNFQVx1NTMwNVx1NTQyQlx1NEUwMFx1N0JDN1x1NjU4N1x1N0FFMFx1NTQ4Q1x1OTY0NFx1NEVGNlx1MzAxMVx1NTIxOVx1NjU4N1x1NEVGNlx1NTQwRFx1OTcwMFx1ODk4MVx1NTQ4Q1x1NzZFRVx1NUY1NVx1NzY4NFx1NTQwRFx1NUI1N1x1NEUwMFx1ODFGNCEnKTtcclxuICAgIGxvZyhgcmVuYW1lICR7b2xkUGF0aH0gLT4gJHtuZXdQYXRofSBgKTtcclxuICAgIHJlbmFtZVN5bmMob2xkUGF0aCwgbmV3UGF0aCk7XHJcbiAgfVxyXG4gIGlmIChoYXNJbmRleE1kICYmIGhhc0ZvbGRlck1kICYmICFoYXNPdGhlck1kKSB7XHJcbiAgICAvLyBcdTY3MDlpbmRleC5tZCBcdTRFNUZcdTY3MDkgbXliYXRpcy5tZCBcdTZDQTFcdTY3MDlcdTUxNzZcdTRFRDZcdTY1ODdcdTRFRjYgXHU5MUNEXHU1NDdEXHU1NDBEXHU1MzlGXHU2NzY1XHU3Njg0aW5kZXgubWRcdTY1ODdcdTRFRjZcclxuICAgIGNvbnN0IHVubGlua1BhdGggPSBqb2luKGRpciwgJ2luZGV4Lm1kJyk7XHJcbiAgICBjb25zdCB1bmxpbmtQYXRoQmFrID0gam9pbihkaXIsIGBpbmRleC5tZC4ke2dldFRpbWVTdHIoKX0uZGVsLmJha2ApO1xyXG4gICAgbG9nKGBcdTU5MDdcdTRFRkQgJHt1bmxpbmtQYXRofSAtPiAke3VubGlua1BhdGhCYWt9IGApO1xyXG4gICAgcmVuYW1lU3luYyh1bmxpbmtQYXRoLCB1bmxpbmtQYXRoQmFrKTtcclxuICAgIGxvZygnXHUzMDEwXHU0RTAwXHU0RTJBXHU3NkVFXHU1RjU1XHU0RTBCXHU1M0VBXHU1MzA1XHU1NDJCXHU0RTAwXHU3QkM3XHU2NTg3XHU3QUUwXHU1NDhDXHU5NjQ0XHU0RUY2XHUzMDExXHU0RTBEXHU4MEZEXHU1ODlFXHU1MkEwXHU5ODlEXHU1OTE2XHU3Njg0XHU3RDIyXHU1RjE1XHU2NTg3XHU0RUY2XHVGRjAxJyk7XHJcbiAgICBsb2coYGRlbGV0ZSAke3VubGlua1BhdGh9YCk7XHJcbiAgfVxyXG4gIGlmIChoYXNJbmRleE1kICYmIGhhc0ZvbGRlck1kICYmIGhhc090aGVyTWQpIHtcclxuICAgIC8vIFx1NjcwOWluZGV4Lm1kIFx1NEU1Rlx1NjcwOSBteWJhdGlzLm1kIFx1NEU1Rlx1NjcwOVx1NTE3Nlx1NEVENm1kIFx1OTFDRFx1NTQ3RFx1NTQwRCBteWJhdGlzLm1kIFx1NEY1Q1x1NEUzQVx1NTkwN1x1NEVGRFx1NEVFM1x1ODg2OFx1OTcwMFx1ODk4MVx1OTFDRFx1NjVCMFx1NTQ3RFx1NTQwRFxyXG4gICAgY29uc3QgdW5saW5rUGF0aCA9IGpvaW4oZGlyLCBgJHtiYXNlbmFtZShkaXIpfS5tZGApO1xyXG4gICAgY29uc3QgdW5saW5rUGF0aEJhayA9IGpvaW4oZGlyLCBgJHtiYXNlbmFtZShkaXIpfS5tZC4ke2dldFRpbWVTdHIoKX0uZGVsLmJha2ApO1xyXG4gICAgbG9nKGBcdTU5MDdcdTRFRkQgJHt1bmxpbmtQYXRofSAtPiAke3VubGlua1BhdGhCYWt9IGApO1xyXG4gICAgcmVuYW1lU3luYyh1bmxpbmtQYXRoLCB1bmxpbmtQYXRoQmFrKTtcclxuICAgIGxvZygnXHU1M0VBXHU2NzA5XHUzMDEwXHU0RTAwXHU0RTJBXHU3NkVFXHU1RjU1XHU0RTBCXHU1M0VBXHU1MzA1XHU1NDJCXHU0RTAwXHU3QkM3XHU2NTg3XHU3QUUwXHU1NDhDXHU5NjQ0XHU0RUY2XHUzMDExXHU2MjREXHU1M0VGXHU0RUU1XHU0RjdGXHU3NTI4XHU2NTg3XHU0RUY2XHU1OTM5XHU1NDBDXHU1NDBEbWRcdTU0N0RcdTU0MERcdUZGMDEnKTtcclxuICAgIGxvZyhgZGVsZXRlICR7dW5saW5rUGF0aH1gKTtcclxuICB9XHJcbiAgLy8gXHU5MDEyXHU1RjUyXHU1OTA0XHU3NDA2XHU1QjUwXHU2NTg3XHU0RUY2XHU1OTM5XHJcbiAgcmVhZGRpclN5bmMoZGlyKS5maWx0ZXIoZiA9PiB7XHJcbiAgICBjb25zdCBzdGF0cyA9IHN0YXRTeW5jKGpvaW4oZGlyLCBmKSk7XHJcbiAgICByZXR1cm4gIURFRkFVTFRfSUdOT1JFX0ZPTERFUi5pbmNsdWRlcyhmKSAmJlxyXG4gICAgICAoZi5lbmRzV2l0aCgnLm1kJykgfHwgc3RhdHMuaXNEaXJlY3RvcnkoKSk7XHJcbiAgfSkuZm9yRWFjaChmaWxlID0+IHtcclxuICAgIGNvbnN0IGZpbGVQYXRoID0gam9pbihkaXIsIGZpbGUpO1xyXG4gICAgaWYgKHN0YXRTeW5jKGZpbGVQYXRoKS5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgIHJlbmFtZUluZGV4TWQoZmlsZVBhdGgpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBcdTYzOTJcdTk2NjRcdTc2ODRcdTY1ODdcdTRFRjZcdTU0MERcclxuY29uc3QgZXhjbHVkZWRGaWxlcyA9IERFRkFVTFRfSUdOT1JFX0ZPTERFUjtcclxuXHJcbmZ1bmN0aW9uIGdlbmVyYXRlSW5kZXggKGRpcjogc3RyaW5nLCBvcHRpb246IEluZGV4UGx1Z2luT3B0aW9uVHlwZSk6IHZvaWQge1xyXG4gIGNvbnN0IHsgbWRGaWxlUGF0aCA9ICdkb2NzJyB9ID0gb3B0aW9uO1xyXG4gIGNvbnN0IGZpbGVzMSA9IHJlYWRkaXJTeW5jKGRpcik7XHJcbiAgbGV0IHMgPSBiYXNlbmFtZShkaXIpO1xyXG4gIGlmIChzID09PSBtZEZpbGVQYXRoKSB7XHJcbiAgICBzID0gJ1x1NzZFRVx1NUY1NSc7XHJcbiAgfVxyXG4gIGxldCBpbmRleENvbnRlbnQgPSBgIyAke3N9XFxuYDtcclxuICBsZXQgZmlsZXMgPSBmaWxlczEuc29ydCgoYTogc3RyaW5nLCBiOiBzdHJpbmcpOiBudW1iZXIgPT4ge1xyXG4gICAgY29uc3Qgc3RhdHNBID0gc3RhdFN5bmMoam9pbihkaXIsIGEpKTtcclxuICAgIGNvbnN0IHN0YXRzQiA9IHN0YXRTeW5jKGpvaW4oZGlyLCBiKSk7XHJcbiAgICAvKiBpZiAoc3RhdHNBLmlzRGlyZWN0b3J5KCkgJiYgc3RhdHNCLmlzRGlyZWN0b3J5KCkpIHtcclxuICAgICAgcmV0dXJuIHN0YXRzQi5tdGltZU1zIC0gc3RhdHNBLm10aW1lTXM7XHJcbiAgICB9IGVsc2UgaWYgKHN0YXRzQS5pc0RpcmVjdG9yeSgpICYmIHN0YXRzQi5pc0ZpbGUoKSkge1xyXG4gICAgICByZXR1cm4gMTtcclxuICAgIH0gZWxzZSBpZiAoc3RhdHNBLmlzRmlsZSgpICYmIHN0YXRzQi5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgIHJldHVybiAtMTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBzdGF0c0IubXRpbWVNcyAtIHN0YXRzQS5tdGltZU1zO1xyXG4gICAgfSAqL1xyXG4gICAgcmV0dXJuIHN0YXRzQi5tdGltZU1zIC0gc3RhdHNBLm10aW1lTXM7XHJcbiAgfSk7XHJcbiAgLy8gXHU4RkM3XHU2RUU0XHU2MzkyXHU5NjY0XHU3Njg0XHU3NkVFXHU1RjU1XHJcbiAgY29uc3QgZmlsdGVyZWQgPSBmaWxlcy5maWx0ZXIoZiA9PiB7XHJcbiAgICBjb25zdCBzdGF0cyA9IHN0YXRTeW5jKGpvaW4oZGlyLCBmKSk7XHJcbiAgICByZXR1cm4gIURFRkFVTFRfSUdOT1JFX0ZPTERFUi5pbmNsdWRlcyhmKSAmJlxyXG4gICAgICAoZi5lbmRzV2l0aCgnLm1kJykgfHwgc3RhdHMuaXNEaXJlY3RvcnkoKSk7XHJcbiAgfSk7XHJcbiAgaWYgKGZpbHRlcmVkLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgLy8gXHU1OTgyXHU2NzlDXHU2MzkyXHU5NjY0XHU1NDBFXHU1M0VBXHU1MjY5XHU0RTAwXHU0RTJBXHU1NDBDXHU1NDBEbWRcdTY1ODdcdTRFRjYsXHU1MjE5XHU4REYzXHU4RkM3XHU1RTc2XHU0RTE0XHU1MjIwXHU5NjY0XHU1MzlGXHU2NzY1XHU3Njg0aW5kZXgubWRcclxuICAgIGlmIChmaWx0ZXJlZFswXSA9PT0gYCR7YmFzZW5hbWUoZGlyKX0ubWRgKSB7XHJcbiAgICAgIC8vIFx1NTIyMFx1OTY2NFx1NURGMlx1NUI1OFx1NTcyOFx1NzY4NCBpbmRleC5tZFxyXG4gICAgICBjb25zdCBpbmRleFBhdGggPSBqb2luKGRpciwgJ2luZGV4Lm1kJyk7XHJcbiAgICAgIGNvbnN0IGV4aXN0c1N5bmMxID0gZXhpc3RzU3luYyhpbmRleFBhdGgpO1xyXG4gICAgICBpZiAoZXhpc3RzU3luYzEpIHtcclxuICAgICAgICBjb25zdCB1bmxpbmtQYXRoQmFrID0gam9pbihkaXIsIGBpbmRleC5tZC4ke2dldFRpbWVTdHIoKX0uZGVsLmJha2ApO1xyXG4gICAgICAgIGxvZyhgXHU1OTA3XHU0RUZEICR7aW5kZXhQYXRofSAtPiAke3VubGlua1BhdGhCYWt9IGApO1xyXG4gICAgICAgIHJlbmFtZVN5bmMoaW5kZXhQYXRoLCB1bmxpbmtQYXRoQmFrKTtcclxuICAgICAgICBsb2coYGRlbGV0ZSAke2luZGV4UGF0aH1gKTtcclxuICAgICAgICBmaWxlcyA9IGZpbGVzLmZpbHRlcihmID0+IGYgIT09ICdpbmRleC5tZCcpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBcdTU5ODJcdTY3OUNcdTUzRUFcdTY3MDlcdTRFMDBcdTRFMkFtZFx1NjU4N1x1NEVGNlx1NEY0Nlx1NjYyRlx1NTQwRFx1NzlGMFx1NTQ4Q1x1NzZFRVx1NUY1NVx1NEUwRFx1NEUwMFx1ODFGNFx1NTIxOVx1NUU5NFx1OEJFNVx1NTIyMFx1OTY2NFx1OEZEOVx1NEUyQVx1NzZFRVx1NUY1NVx1NEUwQlx1NTQ4Q1x1NzZFRVx1NUY1NVx1NTQwQ1x1NTQwRFx1NzY4NG1kXHJcbiAgICAgIC8vIFx1NzZFRVx1NUY1NVx1NTQwQ1x1NTQwRFx1NzY4NFx1NTNFQVx1NUU5NFx1OEJFNVx1NUI1OFx1NTcyOFx1NEU4RVx1NjcwOVx1OTY0NFx1NEVGNlx1NzY4NFx1NjU4N1x1N0FFMFx1NTE4NVxyXG4gICAgICBjb25zdCBpbmRleFBhdGggPSBqb2luKGRpciwgYCR7YmFzZW5hbWUoZGlyKX0ubWRgKTtcclxuICAgICAgY29uc3QgZXhpc3RzU3luYzEgPSBleGlzdHNTeW5jKGluZGV4UGF0aCk7XHJcbiAgICAgIGlmIChleGlzdHNTeW5jMSkge1xyXG4gICAgICAgIGNvbnN0IHVubGlua1BhdGhCYWsgPSBqb2luKGRpciwgYCR7YmFzZW5hbWUoZGlyKX0ubWQuJHtnZXRUaW1lU3RyKCl9LmRlbC5iYWtgKTtcclxuICAgICAgICBsb2coYFx1NTkwN1x1NEVGRCAke2luZGV4UGF0aH0gLT4gJHt1bmxpbmtQYXRoQmFrfSBgKTtcclxuICAgICAgICByZW5hbWVTeW5jKGluZGV4UGF0aCwgdW5saW5rUGF0aEJhayk7XHJcbiAgICAgICAgbG9nKGBkZWxldGUgJHtpbmRleFBhdGh9YCk7XHJcbiAgICAgICAgZmlsZXMgPSBmaWxlcy5maWx0ZXIoZiA9PiBmICE9PSBgJHtiYXNlbmFtZShkaXIpfS5tZGApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmIChmaWx0ZXJlZC5sZW5ndGggPiAxICYmIGZpbHRlcmVkLmluY2x1ZGVzKGAke2Jhc2VuYW1lKGRpcil9Lm1kYCkpIHtcclxuICAgIC8vIFx1NTIyMFx1OTY2NFx1NzZFRVx1NUY1NVx1NTQwQ1x1NTQwRFx1NzY4NE1EXHU2NTg3XHU0RUY2XHJcbiAgICBjb25zdCBpbmRleFBhdGggPSBqb2luKGRpciwgYCR7YmFzZW5hbWUoZGlyKX0ubWRgKTtcclxuICAgIGNvbnN0IGV4aXN0c1N5bmMxID0gZXhpc3RzU3luYyhpbmRleFBhdGgpO1xyXG4gICAgaWYgKGV4aXN0c1N5bmMxKSB7XHJcbiAgICAgIGNvbnN0IHVubGlua1BhdGhCYWsgPSBqb2luKGRpciwgYCR7YmFzZW5hbWUoZGlyKX0ubWQuJHtnZXRUaW1lU3RyKCl9LmRlbC5iYWtgKTtcclxuICAgICAgbG9nKGBcdTU5MDdcdTRFRkQgJHtpbmRleFBhdGh9IC0+ICR7dW5saW5rUGF0aEJha30gYCk7XHJcbiAgICAgIHJlbmFtZVN5bmMoaW5kZXhQYXRoLCB1bmxpbmtQYXRoQmFrKTtcclxuICAgICAgbG9nKGBkZWxldGUgJHtpbmRleFBhdGh9YCk7XHJcbiAgICAgIGZpbGVzID0gZmlsZXMuZmlsdGVyKGYgPT4gZiAhPT0gYCR7YmFzZW5hbWUoZGlyKX0ubWRgKTtcclxuICAgIH1cclxuICB9XHJcbiAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XHJcbiAgICBpZiAoZXhjbHVkZWRGaWxlcy5pbmNsdWRlcyhmaWxlKSkgY29udGludWU7XHJcbiAgICBjb25zdCBmaWxlUGF0aCA9IGpvaW4oZGlyLCBmaWxlKTtcclxuICAgIGNvbnN0IHN0YXRzID0gc3RhdFN5bmMoZmlsZVBhdGgpO1xyXG4gICAgLy8gXHU2MzkyXHU5NjY0ZG9jcy9pbmRleC5tZFxyXG5cclxuXHJcbiAgICBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xyXG4gICAgICBjb25zdCB0aXRsZTEgPSBnZXRUaXRsZUZyb21GaWxlKGpvaW4oZmlsZVBhdGgsICdpbmRleC5tZCcpKTtcclxuICAgICAgY29uc3QgdGl0bGUyID0gZ2V0VGl0bGVGcm9tRmlsZShqb2luKGZpbGVQYXRoLCAnaW5kZXguTUQnKSk7XHJcbiAgICAgIGNvbnN0IHRpdGxlMyA9IGdldFRpdGxlRnJvbUZpbGUoam9pbihmaWxlUGF0aCwgZmlsZSArICcubWQnKSk7XHJcbiAgICAgIGxldCBvdXQgPSBmaWxlO1xyXG4gICAgICBpZiAodGl0bGUxKSB7XHJcbiAgICAgICAgb3V0ID0gdGl0bGUxO1xyXG4gICAgICB9IGVsc2UgaWYgKHRpdGxlMikge1xyXG4gICAgICAgIG91dCA9IHRpdGxlMjtcclxuICAgICAgfSBlbHNlIGlmICh0aXRsZTMpIHtcclxuICAgICAgICBvdXQgPSB0aXRsZTM7XHJcbiAgICAgIH1cclxuICAgICAgLy8gXHU5MDEyXHU1RjUyXHU1OTA0XHU3NDA2XHU1QjUwXHU2NTg3XHU0RUY2XHU1OTM5XHJcbiAgICAgIGdlbmVyYXRlSW5kZXgoZmlsZVBhdGgsIG9wdGlvbik7XHJcbiAgICAgIGlmIChleGlzdHNTeW5jKGpvaW4oZGlyLCBmaWxlLCAnaW5kZXgubWQnKSkpIHtcclxuICAgICAgICBpbmRleENvbnRlbnQgKz0gYC0gWyR7b3V0fV0oLi8ke2ZpbGV9LylcXG5gO1xyXG4gICAgICB9IGVsc2UgaWYgKGV4aXN0c1N5bmMoam9pbihkaXIsIGZpbGUsIGAke2ZpbGV9Lm1kYCkpKSB7XHJcbiAgICAgICAgaW5kZXhDb250ZW50ICs9IGAtIFske291dH1dKC4vJHtmaWxlfS8ke2ZpbGV9Lm1kKVxcbmA7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoZmlsZS5lbmRzV2l0aCgnLm1kJykpIHtcclxuICAgICAgY29uc3QgdGl0bGUgPSBnZXRUaXRsZUZyb21GaWxlKGZpbGVQYXRoKTtcclxuICAgICAgbGV0IG91dCA9IGZpbGU7XHJcbiAgICAgIGlmICh0aXRsZSkge1xyXG4gICAgICAgIG91dCA9IHRpdGxlO1xyXG4gICAgICB9XHJcbiAgICAgIGluZGV4Q29udGVudCArPSBgLSBbJHtvdXR9XSguLyR7ZmlsZX0pXFxuYDtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gXHU1OTgyXHU2NzlDXHU0RTBEXHU1MzA1XHU1NDJCXHU2NTg3XHU0RUY2XHU1OTM5XHU1NDBDXHU1NDBEXHU2NTg3XHU0RUY2XHU1QzMxXHU1MTk5XHU1MTY1XHU1MjMwaW5kZXgubWRcdTRFMkRcclxuICBpZiAoIWZpbGVzLmluY2x1ZGVzKGAke2Jhc2VuYW1lKGRpcil9Lm1kYCkpIHtcclxuICAgICBpZiAoYmFzZW5hbWUoZGlyKSA9PT0gJ2RvY3MnKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgICB9XHJcbiAgICB3cml0ZUlmRGlmZmVyZW50KGRpciwgJ2luZGV4Lm1kJywgaW5kZXhDb250ZW50KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHdyaXRlSWZEaWZmZXJlbnQgKGRpcjogc3RyaW5nLCBmaWxlTmFtZTogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcpOiB2b2lkIHtcclxuICBjb25zdCBmaWxlUGF0aCA9IGpvaW4oZGlyLCBmaWxlTmFtZSk7XHJcbiAgLy8gXHU2OEMwXHU2N0U1XHU2NTg3XHU0RUY2XHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XHJcbiAgaWYgKGV4aXN0c1N5bmMoZmlsZVBhdGgpKSB7XHJcbiAgICAvLyBcdThCRkJcdTUzRDZcdTczQjBcdTY3MDlcdTY1ODdcdTRFRjZcdTc2ODRcdTUxODVcdTVCQjlcclxuICAgIGNvbnN0IGV4aXN0aW5nQ29udGVudCA9IHJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0ZjgnKTtcclxuICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NzNCMFx1NjcwOVx1NTE4NVx1NUJCOVx1NTQ4Q1x1ODk4MVx1NTE5OVx1NTE2NVx1NzY4NFx1NTE4NVx1NUJCOVx1NEUwMFx1ODFGNFx1RkYwQ1x1NTIxOVx1NEUwRFx1NTE5OVx1NTE2NVxyXG4gICAgaWYgKGV4aXN0aW5nQ29udGVudCA9PT0gY29udGVudCkge1xyXG4gICAgICAvLyBsb2coJ1x1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVx1NEUwMFx1ODFGNFx1RkYwQ1x1NEUwRFx1OTcwMFx1ODk4MVx1NTE5OVx1NTE2NScpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIFx1NTE5OVx1NTE2NVx1NjVCMFx1NTE4NVx1NUJCOVxyXG4gIHdyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGNvbnRlbnQpO1xyXG4gIGxvZyhmaWxlUGF0aCArICcgXHU2NTg3XHU0RUY2XHU1REYyXHU1MTk5XHU1MTY1Jyk7XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVml0ZVBsdWdpblZpdGVQcmVzc0F1dG9JbmRleCAoXHJcbiAgb3B0OiBJbmRleFBsdWdpbk9wdGlvblR5cGUgPSB7fVxyXG4pOiBQbHVnaW4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAndml0ZS1wbHVnaW4tdml0ZXByZXNzLWF1dG8taW5kZXgnLFxyXG4gICAgY29uZmlndXJlU2VydmVyICh7XHJcbiAgICAgIHdhdGNoZXIsXHJcbiAgICAgIHJlc3RhcnRcclxuICAgIH06IFZpdGVEZXZTZXJ2ZXIpIHtcclxuICAgICAgb3B0aW9uID0gb3B0O1xyXG4gICAgICBjb25zdCB7IG1kRmlsZVBhdGggPSAnZG9jcycgfSA9IG9wdGlvbjtcclxuICAgICAgY29uc3QgZnNXYXRjaGVyID0gd2F0Y2hlci5hZGQoam9pbihwcm9jZXNzLmN3ZCgpLCBtZEZpbGVQYXRoKSk7XHJcbiAgICAgIGZzV2F0Y2hlci5vbignYWxsJywgYXN5bmMgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgaWYgKGV2ZW50ID09PSAnYWRkRGlyJykge1xyXG4gICAgICAgICAgbG9nKCd3YXRjaCBhZGREaXIgJyk7XHJcbiAgICAgICAgICBhd2FpdCByZXN0YXJ0KCk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChldmVudCA9PT0gJ3VubGlua0RpcicpIHtcclxuICAgICAgICAgIGxvZygnd2F0Y2ggdW5saW5rRGlyJyk7XHJcbiAgICAgICAgICBhd2FpdCByZXN0YXJ0KCk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChldmVudCA9PT0gJ2FkZCcpIHtcclxuICAgICAgICAgIGxvZygnd2F0Y2ggYWRkJyk7XHJcbiAgICAgICAgICBhd2FpdCByZXN0YXJ0KCk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChldmVudCA9PT0gJ3VubGluaycpIHtcclxuICAgICAgICAgIGxvZygnd2F0Y2ggdW5saW5rJyk7XHJcbiAgICAgICAgICBhd2FpdCByZXN0YXJ0KCk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChldmVudCA9PT0gJ2NoYW5nZScpIHtcclxuICAgICAgICAgIGxvZygnd2F0Y2ggY2hhbmdlJyk7XHJcbiAgICAgICAgICBhd2FpdCByZXN0YXJ0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBjb25maWcgKGNvbmZpZykge1xyXG4gICAgICBvcHRpb24gPSBvcHQ7XHJcbiAgICAgIGNvbnN0IHsgbWRGaWxlUGF0aCA9ICdkb2NzJyB9ID0gb3B0aW9uO1xyXG4gICAgICAvLyBcdTUxNjVcdTUzRTNcdTc2RUVcdTVGNTVcclxuICAgICAgY29uc3QgZG9jc1Jvb3QgPSBqb2luKHByb2Nlc3MuY3dkKCksIG1kRmlsZVBhdGgpO1xyXG4gICAgICBsb2coJ2JlZ2luIHJlbmFtZSBcdTkxQ0RcdTU0N0RcdTU0MEQnKTtcclxuICAgICAgcmVuYW1lSW5kZXhNZChkb2NzUm9vdCk7XHJcbiAgICAgIGxvZygnZmluc2ggcmVuYW1lIFx1OTFDRFx1NTQ3RFx1NTQwRCcpO1xyXG4gICAgICBnZW5lcmF0ZUluZGV4KGRvY3NSb290LCBvcHRpb24pO1xyXG4gICAgICBsb2coJ2luZGV4IGdlbmVyYXRlIGZpbmlzaCEnKTtcclxuICAgICAgcmV0dXJuIGNvbmZpZztcclxuICAgIH1cclxuICB9O1xyXG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxWaXRlUHJlc3NcXFxcZG9jc1xcXFwudml0ZXByZXNzXFxcXHZpdGVwcmVzcy1wbHVnaW4tYXV0by1pbmRleFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcVml0ZVByZXNzXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFx2aXRlcHJlc3MtcGx1Z2luLWF1dG8taW5kZXhcXFxcdXRpbHMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1ZpdGVQcmVzcy9kb2NzLy52aXRlcHJlc3Mvdml0ZXByZXNzLXBsdWdpbi1hdXRvLWluZGV4L3V0aWxzLnRzXCI7LypcclxuICogQERlc2NyaXB0aW9uOlxyXG4gKiBAQXV0aG9yOiB6aGVuZ2ZlaS50YW5cclxuICogQERhdGU6IDIwMjUtMDMtMDYgMTc6MjQ6MDVcclxuICogQEZpbGVQYXRoOiBcXFZpdGVQcmVzc1xcZG9jc1xcLnZpdGVwcmVzc1xcdml0ZXByZXNzLXBsdWdpbi1hdXRvLWluZGV4XFx1dGlscy50c1xyXG4gKi9cclxuaW1wb3J0IGMgZnJvbSAncGljb2NvbG9ycyc7XHJcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50JztcclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX0lHTk9SRV9GT0xERVIgPSBbJ3B1YmxpYycsJ3NjcmlwdHMnLCAnY29tcG9uZW50cycsICdhc3NldHMnLCAnLnZpdGVwcmVzcycsICdpbmRleC5tZCddO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZyAoLi4uaW5mbzogc3RyaW5nW10pOiB2b2lkIHtcclxuICBjb25zb2xlLmxvZyhjLmJvbGQoYy5jeWFuKCdbYXV0by1pbmRleF0nKSksIC4uLmluZm8pO1xyXG59XHJcblxyXG4vLyByZW1vdmUgdGhlIGZpbGUgcHJlZml4XHJcbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVQcmVmaXggKHN0cjogc3RyaW5nLCBpZGVudGlmaWVyOiBzdHJpbmcgfCBSZWdFeHApOiBzdHJpbmcge1xyXG4gIHJldHVybiBzdHIucmVwbGFjZShpZGVudGlmaWVyLCAnJyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUaW1lU3RyICgpOiBzdHJpbmcge1xyXG4gIHJldHVybiBtb21lbnQoKS5mb3JtYXQoJ1lZWVlNTUREX2trX21tX3NzJyk7XHJcbn0iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9RLFNBQVMsb0JBQW9COzs7QUNNalMsU0FBUyxVQUFVLFlBQVk7QUFDL0IsU0FBUyxZQUFZLGFBQWEsY0FBYyxZQUFZLFVBQVUscUJBQXFCOzs7QUNEM0YsT0FBTyxPQUFPO0FBQ2QsT0FBTyxZQUFZO0FBRVosSUFBTSx3QkFBd0IsQ0FBQyxVQUFTLFdBQVcsY0FBYyxVQUFVLGNBQWMsVUFBVTtBQUVuRyxTQUFTLE9BQVEsTUFBc0I7QUFDNUMs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
