const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (req, res) => {
  let target = "https://github.com/"; // 目标代理地址

  // 创建代理实例
  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    selfHandleResponse: true, // 启用自定义响应处理
    pathRewrite: {},
  });

  // 处理代理响应
  proxy.on("proxyRes", (proxyRes, req, res) => {
    let body = [];
    // 收集响应数据
    proxyRes.on("data", (chunk) => {
      body.push(chunk);
    });

    // 响应完成后处理
    proxyRes.on("end", () => {
      const contentType = proxyRes.headers["content-type"] || "";
      let responseBody = Buffer.concat(body).toString("utf8");

      // 只处理HTML内容
      if (contentType.includes("text/html")) {
        // 替换图片路径中的github.com
        responseBody = responseBody.replace(
          /https?:\/\/github\.com/g,
          "https://gh.houheya.us.kg"
        );
        // 替换文字中的github.com
        responseBody = responseBody.replace(/github\.com/g, "gh.houheya.us.kg");
      }

      // 移除可能导致内容长度不匹配的header
      delete proxyRes.headers["content-length"];

      // 复制原始响应头
      Object.keys(proxyRes.headers).forEach((key) => {
        res.setHeader(key, proxyRes.headers[key]);
      });

      // 发送处理后的响应
      res.statusCode = proxyRes.statusCode;
      res.end(responseBody);
    });
  });

  // 执行代理
  proxy(req, res);
};
