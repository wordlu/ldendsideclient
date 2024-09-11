module.exports = {
  // 是否在每行末尾添加分号
  semi: false,
  // 是否使用单引号而不是双引号
  singleQuote: true,
  // 是否在箭头函数仅有一个参数时也给参数加上括号
  arrowParens: 'avoid',
  // If true, puts the `>` of a multi-line HTML (HTML, JSX, Vue, Angular) element at the end of the last line instead of being alone on the next line (does not apply to self closing elements).
  bracketSameLine: true,
  // 是否在括号内添加空格
  bracketSpacing: true,
  // 是否对被引号包裹的代码使用智能格式化
  embeddedLanguageFormatting: 'auto',
  // 指定文件结尾换行符
  endOfLine: 'lf',
  // 指定 HTML 标签中空格的处理方式。选项： `css` - 将块级元素中的空格进行格式化、 `strict` - 所有空格都不格式化、 `ignore`- 所有空格格式化
  htmlWhitespaceSensitivity: 'css',
  insertPragma: false,
  // This option has been deprecated in v2.4.0, use `bracketSameLine` instead.
  // 是否将有多个属性的 jsx 标签的 `>` 放在最后一个属性的末尾，而不是另起一行
  jsxBracketSameLine: true,
  // 是否在 JSX 中使用单引号而不是双引号
  jsxSingleQuote: false,
  // 指定每行代码的最佳长度，如果超出该长度则格式化
  printWidth: 100,
  // （Markdown）将散文包含在多行中
  proseWrap: 'preserve',
  // 指定 object的 key 添加引号的方式。选项： `as-needed` - 只有在需求要的情况下加引号、 `consistent` - 有一个需要引号就给其他都统一加上、 `preserve` - 保留用户输入的引号
  quoteProps: 'as-needed',
  // 是否使用 prettier configuration 来格式化。 文档链接 [documentation for valid configuration files](https://prettier.io/docs/en/configuration.html) 。即使该项被设置 true，未命名文件仍会使用 VS Code 设置中的配置方案进行格式化
  requireConfig: false,
  // 是否只对有特定开头编译指示（如 `@format` ）的文件进行格式化
  requirePragma: false,
  // 是否在当前 `node_modules` 无法解析时使用全局 `node_modules` 。可能造成性能上的影响
  resolveGlobalModules: false,
  // If true, enforces single attribute per line in HTML, Vue and JSX.
  singleAttributePerLine: false,
  // 指定每个制表符占用的空格数
  tabWidth: 2,
  // 指定添加尾随逗号的方式。选项：`none` - 无尾随逗号、 `es5` - 在 ES5 中有效的尾随逗号（如对象与数组等）、 `all` - 尽可能添加尾随逗号（如函数参数）
  trailingComma: 'es5',
  // 是否使用 tab 缩进，而不是空格缩进
  useTabs: false,
  // 是否缩进 Vue 的 `<script>` 和 `<style>` 标签。可能会影响到编辑器的代码折叠功能
  vueIndentScriptAndStyle: false,
  // 是否允许 prettier 格式化 `node_modules` 中的文件
  withNodeModules: false,
}
