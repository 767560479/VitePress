import{u as p,o as i,c as o,a as e,t as s,b as n,d as c,e as a}from"./app.6f8a70b8.js";const d=c(`<h1 id="runtime-api-examples" tabindex="-1">Runtime API Examples <a class="header-anchor" href="#runtime-api-examples" aria-hidden="true">#</a></h1><p>This page demonstrates usage of some of the runtime APIs provided by VitePress.</p><p>The main <code>useData()</code> API can be used to access site, theme, and page data for the current page. It works in both <code>.md</code> and <code>.vue</code> files:</p><div class="language-md line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">md</span><pre class="shiki material-theme-palenight" tabindex="0"><code><span class="line"><span style="color:#BABED8;">&lt;script setup&gt;</span></span>
<span class="line"><span style="color:#BABED8;">import { useData } from &#39;vitepress&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#BABED8;">const { theme, page, frontmatter } = useData()</span></span>
<span class="line"><span style="color:#BABED8;">&lt;/script&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">## </span><span style="color:#FFCB6B;">Results</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">### </span><span style="color:#FFCB6B;">Theme Data</span></span>
<span class="line"><span style="color:#BABED8;">&lt;pre&gt;{{ theme }}&lt;/pre&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">### </span><span style="color:#FFCB6B;">Page Data</span></span>
<span class="line"><span style="color:#BABED8;">&lt;pre&gt;{{ page }}&lt;/pre&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">### </span><span style="color:#FFCB6B;">Page Frontmatter</span></span>
<span class="line"><span style="color:#BABED8;">&lt;pre&gt;{{ frontmatter }}&lt;/pre&gt;</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><h2 id="results" tabindex="-1">Results <a class="header-anchor" href="#results" aria-hidden="true">#</a></h2><h3 id="theme-data" tabindex="-1">Theme Data <a class="header-anchor" href="#theme-data" aria-hidden="true">#</a></h3>`,6),m=e("h3",{id:"page-data",tabindex:"-1"},[a("Page Data "),e("a",{class:"header-anchor",href:"#page-data","aria-hidden":"true"},"#")],-1),u=e("h3",{id:"page-frontmatter",tabindex:"-1"},[a("Page Frontmatter "),e("a",{class:"header-anchor",href:"#page-frontmatter","aria-hidden":"true"},"#")],-1),h=e("h2",{id:"more",tabindex:"-1"},[a("More "),e("a",{class:"header-anchor",href:"#more","aria-hidden":"true"},"#")],-1),b=e("p",null,[a("Check out the documentation for the "),e("a",{href:"https://vitepress.dev/reference/runtime-api#usedata",target:"_blank",rel:"noreferrer"},"full list of runtime APIs"),a(".")],-1),F=JSON.parse('{"title":"Runtime API Examples","description":"","frontmatter":{"outline":"deep"},"headers":[{"level":2,"title":"Results","slug":"results","link":"#results","children":[{"level":3,"title":"Theme Data","slug":"theme-data","link":"#theme-data","children":[]},{"level":3,"title":"Page Data","slug":"page-data","link":"#page-data","children":[]},{"level":3,"title":"Page Frontmatter","slug":"page-frontmatter","link":"#page-frontmatter","children":[]}]},{"level":2,"title":"More","slug":"more","link":"#more","children":[]}],"relativePath":"api-examples.md"}'),g={name:"api-examples.md"},v=Object.assign(g,{setup(_){const{site:f,theme:t,page:l,frontmatter:r}=p();return(D,B)=>(i(),o("div",null,[d,e("pre",null,s(n(t)),1),m,e("pre",null,s(n(l)),1),u,e("pre",null,s(n(r)),1),h,b]))}});export{F as __pageData,v as default};