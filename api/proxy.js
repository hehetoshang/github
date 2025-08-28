const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (req, res) => {
  let target = "https://github.com/";

  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    selfHandleResponse: true, // 启用自定义响应处理
    pathRewrite: {},
  });

  // 处理代理响应
  proxy.on("proxyRes", (proxyRes, req, res) => {
    const chunks = [];
    proxyRes.on("data", (chunk) => chunks.push(chunk));
    proxyRes.on("end", () => {
      try {
        // 合并响应内容
        const buffer = Buffer.concat(chunks);
        let body = buffer.toString("utf8");

        // 替换所有github.com相关内容
        body = body.replace(/https?:\/\/github\.com/g, "https://gh.houheya.us.kg");
        body = body.replace(/github\.com/g, "gh.houheya.us.kg");

        // 更新响应头（避免内容长度不匹配）
        delete proxyRes.headers["content-length"];
        res.setHeader("Content-Length", Buffer.byteLength(body, "utf8"));

        // 复制原始响应头并发送处理后的内容
        Object.entries(proxyRes.headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        res.statusCode = proxyRes.statusCode;
        res.end(body);
      } catch (err) {
        console.error("Proxy error:", err);
        res.statusCode = 500;
        res.end("Proxy server error");
      }
    });
  });

  // 处理代理错误
  proxy.on("error", (err) => {
    console.error("Proxy connection error:", err);
    res.statusCode = 500;
    res.end("Proxy connection failed");
  });

  proxy(req, res);
};
