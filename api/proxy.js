const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (req, res) => {
  // 目标网站 - 默认是GitHub
  const target = "https://github.com/";
  
  // 创建最简单的代理配置，优先保证速度和避免超时
  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true, // 传递原始请求头信息
    
    // 移除任何可能导致延迟的复杂处理
    onProxyRes: function(proxyRes, req, res) {
      // 只进行最基本的响应头处理，不修改响应体
      // 这可以极大减少处理时间，避免Vercel的10秒超时
      
      // 保留原始响应的所有头部信息
      Object.keys(proxyRes.headers).forEach(function(key) {
        res.setHeader(key, proxyRes.headers[key]);
      });
    },
    
    // 简化请求处理
    onProxyReq: function(proxyReq, req, res) {
      // 只添加必要的请求头
      proxyReq.setHeader('X-Forwarded-Proto', 'https');
    },
    
    // 快速错误处理
    onError: function(err, req, res) {
      console.error('Proxy error:', err);
      // 快速返回错误响应，避免长时间等待
      res.status(502).send('Proxy Error');
    },
    
    // 禁用响应体处理以提高速度
    selfHandleResponse: false,
    
    // Vercel的超时限制是10秒，所以设置一个更短的超时以避免被强制终止
    timeout: 8000 // 8秒超时，留出缓冲时间
  });
  
  // 立即执行代理，不做任何预处理
  proxy(req, res);
};
