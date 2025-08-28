const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (req, res) => {
  let target = "https://github.com/";//your website url
  //   if (
  //     req.url.startsWith("/api") ||
  //     req.url.startsWith("/auth") ||
  //     req.url.startsWith("/banner") ||
  //     req.url.startsWith("/CollegeTask")
  //   ) {
  //     target = "http://106.15.2.32:6969";
  //   }

  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      // rewrite request path `/backend`
      //  /backend/user/login => http://google.com/user/login
      //   "^/backend/": "/",
    },
    onProxyRes: (proxyRes, req, res) => {
      // 检查响应是否为HTML内容
      const contentType = proxyRes.headers['content-type'];
      if (contentType && contentType.includes('text/html')) {
        let body = '';
        proxyRes.on('data', (chunk) => {
          body += chunk;
        });
        proxyRes.on('end', () => {
          // 替换HTML内容中的github.com链接为gh.houheya.us.kg
          const modifiedBody = body
            .replace(/https:\/\/github\.com\//g, 'https://gh.houheya.us.kg/')
            .replace(/http:\/\/github\.com\//g, 'https://gh.houheya.us.kg/')
            .replace(/github\.com\//g, 'gh.houheya.us.kg/');
          
          // 更新响应头中的Content-Length
          res.setHeader('Content-Length', Buffer.byteLength(modifiedBody));
          // 发送修改后的内容
          res.end(modifiedBody);
        });
        // 移除原始的Content-Length头，因为我们要修改内容
        delete proxyRes.headers['content-length'];
      }
    }
  })(req, res);
};
