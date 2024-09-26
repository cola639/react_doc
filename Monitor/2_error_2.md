要在 Sentry 中捕捉到原始的源代码行数和内容（即没有经过哈希和压缩处理的代码，而是实际的源代码行数），你需要启用 **source maps** 功能。`source maps` 能够将压缩或打包后的代码（如经过 Webpack 或 Vite 处理后的代码）映射回原始的未压缩的源代码，这样当发生错误时，Sentry 可以展示出原始源代码中的行数和上下文内容。

### 如何在 Sentry 中捕捉源代码行数和内容

#### 1. **生成 Source Maps**

Source Maps 是用来将压缩后的代码映射回原始源代码的文件。在生产环境中构建 React 应用时，Webpack 和 Vite 等工具可以自动生成 Source Maps。

##### 在 React 项目中（使用 Webpack 或 Vite）

**Webpack：**
Webpack 默认会在生产构建中生成 Source Maps，你可以确保在 Webpack 配置中启用了 `source-map` 选项。

```javascript
// webpack.config.js
module.exports = {
  // 其他配置...
  devtool: "source-map", // 确保启用了 source-map
}
```

**Vite：**
Vite 默认也会生成 Source Maps。你可以确保在生产构建时生成这些文件。

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: true, // 确保 sourcemap 启用
  },
}
```

#### 2. **将 Source Maps 上传到 Sentry**

为了让 Sentry 能够正确地解析和展示错误发生时的原始源代码行数，你需要在生产环境中上传 Source Maps 文件到 Sentry。

Sentry 提供了专门的 `Sentry CLI` 工具，可以帮助你在部署时自动上传 Source Maps。

##### 步骤：

1. **安装 Sentry CLI**：

   通过 npm 或 yarn 安装 Sentry Webpack 插件（或者其他你使用的构建工具的插件）。

   ```bash
   npm install @sentry/webpack-plugin --save-dev
   ```

2. **在 Webpack 中集成 Sentry 插件**：

   在 Webpack 的配置文件中，使用 Sentry 插件来上传 Source Maps。

   ```javascript
   const SentryWebpackPlugin = require("@sentry/webpack-plugin")

   module.exports = {
     // 其他 Webpack 配置...
     devtool: "source-map", // 确保启用了 source maps
     plugins: [
       new SentryWebpackPlugin({
         include: "./dist", // 你的构建文件夹
         ignore: ["node_modules", "webpack.config.js"],
         urlPrefix: "~/",
       }),
     ],
   }
   ```

   这会在每次生产构建时，自动将 Source Maps 文件上传到 Sentry。

3. **配置 Sentry CLI**：

   在项目的根目录下创建 `.sentryclirc` 文件，填入 Sentry 项目的配置信息：

   ```ini
   [defaults]
   url=https://sentry.io/
   org=your-org-slug
   project=your-project-slug

   [auth]
   token=your-auth-token
   ```

   - **org**：你的 Sentry 组织标识。
   - **project**：你的 Sentry 项目标识。
   - **token**：你的 Sentry API 密钥。

4. **构建和上传 Source Maps**：

   构建项目时，确保 Source Maps 生成并被上传到 Sentry。

   ```bash
   npm run build
   ```

   在构建过程中，Sentry 插件会自动将生成的 Source Maps 文件上传到 Sentry。

#### 3. **捕获并显示源代码行数**

当你正确生成并上传了 Source Maps 后，Sentry 将能够在错误报告中解析错误的源代码行数和内容。具体来说，你会在 Sentry 仪表盘中看到：

- **原始的源代码行数**：显示错误发生时在源代码中的确切行号，而不是经过打包后的行号。
- **代码上下文**：显示源代码上下文（错误前后几行代码），便于快速定位问题。

### 4. **Sentry 捕获的错误示例**

当你启用了 Source Maps 并上传后，Sentry 捕获的错误示例将包含以下信息：

1. **Error Message**：错误消息，如 `ReferenceError: myFunction is not defined`。
2. **Stack Trace**：完整的错误堆栈追踪，显示原始源代码中的文件、行号和列号。
3. **Breadcrumbs**：用户操作轨迹，在错误发生之前的交互记录，如点击、页面跳转等。
4. **代码上下文**：在错误发生处，显示相关的原始代码行的上下文。
5. **环境信息**：浏览器、操作系统、设备、用户代理等详细信息。

#### 示例：

在 Sentry 仪表盘中，你将看到：

```
Error Message: "TypeError: Cannot read property 'foo' of undefined"
File: /src/components/MyComponent.js
Line: 42
Column: 15
Code Context:
  40 | function myFunction() {
  41 |   const bar = someUndefinedObject.foo;
  42 |   console.log(bar);
  43 | }
```

### 5. **常见问题及解决方案**

- **没有看到源代码行数**：确保生产构建时生成了 Source Maps 文件，并且正确上传到 Sentry。
- **Sentry 显示压缩后的代码**：通常是因为 Source Maps 没有上传或配置不正确，确保 Source Maps 正确生成并被上传。
- **上传 Source Maps 错误**：检查 `.sentryclirc` 文件中的配置信息（组织、项目、API token）是否正确。
- **Source Maps 文件体积过大**：如果 Source Maps 文件过大，你可以选择 `hidden-source-map`，它不会将 Source Maps 的链接嵌入到生成的文件中，但仍然可以用于错误报告。

```javascript
// 对于 Webpack 的配置
devtool: 'hidden-source-map',
```

### 总结：

1. **生成 Source Maps**：确保在构建过程中生成 Source Maps 文件。
2. **上传 Source Maps 到 Sentry**：使用 Sentry Webpack 插件或 CLI 工具将 Source Maps 上传到 Sentry。
3. **捕获原始源代码的行号和内容**：Sentry 将自动解析错误堆栈，并展示源代码的具体行数和上下文。

通过这些步骤，你可以在 Sentry 中捕获和显示原始源代码的行数、文件名和上下文内容，大大提高问题定位的效率。
