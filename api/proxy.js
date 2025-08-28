const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (req, res) => {
  let target = "https://github.com/"; // 默认目标
  
  // 创建代理中间件
  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: function(path, req) {
      // 将路径中的 github.com 替换为 gh.houheya.us.kg
      return path.replace(/github\.com/g, 'gh.houheya.us.kg');
    },
    onProxyReq: (proxyReq, req, res) => {
      // 修改请求头中的Host
      if (req.url.includes('github.com')) {
        proxyReq.setHeader('Host', 'gh.houheya.us.kg');
      }
    }
  });

  return proxy(req, res);
};
