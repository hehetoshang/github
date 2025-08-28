const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (req, res) => {
  // 初始目标地址
  let target = "https://github.com/";

  // 可选：根据请求路径切换代理目标（保持原有注释逻辑）
  // if (
  //   req.url.startsWith("/api") ||
  //   req.url.startsWith("/auth") ||
  //   req.url.startsWith("/banner") ||
  //   req.url.startsWith("/CollegeTask")
  // ) {
  //   target = "http://106.15.2.32:6969";
  // }

  // 2. 创建代理中间件并添加响应拦截器
  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      // 可根据需要添加路径重写规则
      // "^/backend/": "/",
    },
    // 响应拦截处理
    onProxyRes: (proxyRes, req, res) => {
      let body = '';
      
      // 收集代理响应的数据
      proxyRes.on('data', (chunk) => {
        body += chunk.toString();
      });
      
      // 数据收集完成后替换内容并发送给客户端
      proxyRes.on('end', () => {
        // 替换响应内容中的github.com为gh.houheya.us.kg
        const modifiedBody = body.replace(/github\.com/g, 'gh.houheya.us.kg');
        
        // 设置响应头（确保长度正确）
        res.setHeader('Content-Length', Buffer.byteLength(modifiedBody));
        // 发送修改后的响应
        res.end(modifiedBody);
      });
    }
  });

  // 应用代理
  proxy(req, res);
};
