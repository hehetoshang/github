const { createProxyMiddleware } = require("http-proxy-middleware");

// 文本替换规则：将github.com相关链接替换为目标域名
const textReplacements = {
  'github.com': 'gh.houheya.us.kg',
  'https://github.com': 'https://gh.houheya.us.kg',
  'http://github.com': 'http://gh.houheya.us.kg'
};

module.exports = (req, res) => {
  let target = "https://github.com/"; // 原始目标地址
  
  // 创建代理配置
  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    selfHandleResponse: true, // 启用自定义响应处理
    pathRewrite: {
      // 可根据需要添加路径重写规则
    },
    onProxyRes: (proxyRes, req, res) => {
      let body = '';
      
      // 收集响应数据
      proxyRes.on('data', (chunk) => {
        body += chunk.toString();
      });

      // 处理完成后进行文本替换
      proxyRes.on('end', () => {
        // 仅处理HTML内容
        if (proxyRes.headers['content-type'] && 
            proxyRes.headers['content-type'].includes('text/html')) {
          // 应用所有替换规则
          Object.entries(textReplacements).forEach(([search, replace]) => {
            body = body.replace(new RegExp(search, 'g'), replace);
          });
          
          // 更新内容长度
          res.setHeader('Content-Length', Buffer.byteLength(body));
        }

        // 复制原始响应头
        Object.keys(proxyRes.headers).forEach(key => {
          res.setHeader(key, proxyRes.headers[key]);
        });

        // 发送处理后的响应
        res.end(body);
      });
    }
  });

  return proxy(req, res);
};
