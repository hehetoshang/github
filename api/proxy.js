const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (req, res) => {
  let target = "https://github.com/";//your website url
  
  // 简化版代理配置，解决超时问题
  createProxyMiddleware({
    target,
    changeOrigin: true,
    followRedirects: true,
    timeout: 30000, // 30秒超时设置
    
    // 简化的URL重写配置
    pathRewrite: {
      '^/': '/',
    },
    
    // 简化版响应处理，只处理文本内容
    onProxyRes: function(proxyRes, req, res) {
      const contentType = proxyRes.headers['content-type'] || '';
      
      // 只处理文本/html内容，避免处理所有类型
      if (contentType.includes('text/html')) {
        // 收集响应数据
        let body = [];
        proxyRes.on('data', function(chunk) {
          body.push(chunk);
        });
        
        proxyRes.on('end', function() {
          try {
            // 转换为字符串
            body = Buffer.concat(body).toString('utf8');
            
            // 进行链接替换，但使用更简单的正则表达式
            const modifiedBody = body
              .replace(/https?:\/\/github\.com/g, 'https://gh.houheya.us.kg')
              .replace(/\/\/github\.com/g, 'https://gh.houheya.us.kg')
              .replace(/github\.com/g, 'gh.houheya.us.kg');
            
            // 更新响应头
            delete proxyRes.headers['content-length'];
            
            // 发送修改后的响应
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.send(modifiedBody);
          } catch (error) {
            console.error('Error processing response:', error);
            // 出错时回退到原始响应
            res.send(body);
          }
        });
        
        // 暂停原始流
        proxyRes.pause();
      } else {
        // 对于非HTML内容，直接传递
        proxyRes.pipe(res);
      }
    },
    
    selfHandleResponse: true,
    
    // 配置请求头
    onProxyReq: function(proxyReq, req, res) {
      proxyReq.setHeader('Cache-Control', 'no-cache');
    },
    
    // 错误处理
    onError: function(err, req, res) {
      console.error('Proxy error:', err);
      res.status(502).send('Proxy Error: ' + err.message);
    }
  })(req, res);
};
