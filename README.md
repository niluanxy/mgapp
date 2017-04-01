# MagicAPP

<p>MagicAPP，专为WebAPP而生的开发框架，致力于轻松的写代码，产出用户体验优秀的APP。生成代码可以直接用于移动端，微信端。结合打包工具，可以非常方便的转为原生APP，供用户下载使用。</p>

<p>框架自带一整套的UI，同时整体架构合理灵活，各部分可以单独拆出运行，亦可与其他的框架，库等配合使用。目前框架处于开发预览阶段，可能会有极大的改动，使用请注意。</p>

***

## 基本使用方法:
### 1.项目初始化

<p>项目初始化只需在 <b>项目根目录</b> 执行以下命令：</p>

```CLI
npm install -g gulp
npm install
```

<p><b>第一条命令会将 gulp 安装到全局环境，第二条命令用于项目依赖环境初始化。</b></p>
<p><b>如果已经全局安装过 gulp 命令，则可跳过第一条命令，直接执行第二条命令。</b></p>

<p><b>PS：</b>国内的环境问题，安装可能会很慢，建议先安装 <b>nrm</b> 工具，替换为国内淘宝源，可以极大加快下载速度：</p>

```CLI
npm install -g nrm
nrm use taobao
```

<p>安装完成执行 <b>nrm ls</b> ，类似下面内容则安装成功：</p>

```CLI
  npm ---- https://registry.npmjs.org/
  cnpm --- http://r.cnpmjs.org/
* taobao - http://registry.npm.taobao.org/
  edunpm - http://registry.enpmjs.org/
  eu ----- http://registry.npmjs.eu/
  au ----- http://registry.npmjs.org.au/
  sl ----- http://npm.strongloop.com/
  nj ----- https://registry.nodejitsu.com/
  pt ----- http://registry.npmjs.pt/
```

<p>现在执行项目依赖环境初始化操作，将极大缩短依赖下载时间。</p>

### 2.常用命令说明
<p>框架内置了以下常用命令，说明如下：</p>

```CLI
gulp clean               ## 清理编译产生的临时文件，常用于清理项目

gulp build               ## 编译整个项目
gulp build -r            ## 编译项目并压缩，常用于【项目发布】。最终生成
                            的文件位于 /dist 目录下。

gulp serve               ## 编译项目，同时启动本地开发服务器，此命令自动
                            开启 HMR 热更新功能，主要用于开发使用
gulp serve -r            ## 编译项目并压缩，同时启动本地预览服务器，此命
                            令不会开启 HMR 功能，主要用于发布前测试

gulp dev-build-mixin     ## 只编译框架 mixin 部分
gulp dev-build-minjs     ## 只编译框架 minjs 部分
gulp dev-build-magic     ## 只编译框架 magic 部分
gulp dev-build-mgvue     ## 只编译框架 mgvue 部分
gulp dev-build-mgapp     ## 只编译框架 mgapp 部分
```

### 3.项目开发启动命令

<p>框架集成了<b>livereload、HMR</b>功能，但<b>HMR热更新功能</b>暂时只支持 /app/pages 目录下的样式文件 style.scss，模板文件 template.js，页面主文件 index.js。其他文件编辑后会采用整体刷新页面的形式，后续会逐步开启其他文件的 HMR 功能。项目开发启动命令如下：</p>

```CLI
gulp serve
```

<p>执行后会 <b>先自动编译项目</b>，编译完成会在浏览器弹出项目预览页面。接下来享受编码过程即可，不用去操心文件编译，浏览器刷新等问题。</p>
