const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (req, res) => {
  // 创建代理中间件
  const proxy = createProxyMiddleware({
    target: "https://github.com", // 默认目标，实际不会用到
    changeOrigin: true,
    router: function(req) {
      // 如果请求URL包含github.com，则重定向到镜像站
      if (req.url.includes('github.com') || req.headers.host.includes('github.com')) {
        return "https://gh.houheya.us.kg";
      }
      // 否则保持原目标
      return "https://github.com";
    },
    pathRewrite: function(path, req) {
      // 移除路径中可能存在的原始域名部分
      let newPath = path;
      
      // 如果路径中包含github.com，替换为镜像站域名
      if (path.includes('github.com')) {
        newPath = path.replace(/https?:\/\/[^\/]*github\.com/, '');
      }
      
      // 确保路径以/开头
      if (!newPath.startsWith('/')) {
        newPath = '/' + newPath;
      }
      
      return newPath;
    },
    onProxyReq: (proxyReq, req, res) => {
      // 设置正确的Host头
      if (req.url.includes('github.com') || req.headers.host.includes('github.com')) {
        proxyReq.setHeader('Host', 'gh.houheya.us.kg');
      } else {
        proxyReq.setHeader('Host', 'github.com');
      }
    }
  });

  return proxy(req, res);
};
