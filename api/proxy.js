const { createProxyMiddleware } = require("http-proxy-middleware");
const zlib = require('zlib');

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
      // 复制原始响应头
      Object.keys(proxyRes.headers).forEach(function(key) {
        res.setHeader(key, proxyRes.headers[key]);
      });

      // 检查响应是否为HTML内容
      const contentType = proxyRes.headers['content-type'];
      if (contentType && contentType.includes('text/html')) {
        // 处理可能的压缩响应
        const contentEncoding = proxyRes.headers['content-encoding'];
        let body = [];

        proxyRes.on('data', (chunk) => {
          body.push(chunk);
        });

        proxyRes.on('end', () => {
          body = Buffer.concat(body);
          
          // 解压缩响应内容
          if (contentEncoding === 'gzip') {
            zlib.gunzip(body, (err, decompressed) => {
              if (!err) {
                processBody(decompressed.toString('utf8'));
              } else {
                // 如果解压缩失败，尝试直接处理
                processBody(body.toString('utf8'));
              }
            });
          } else if (contentEncoding === 'deflate') {
            zlib.inflate(body, (err, decompressed) => {
              if (!err) {
                processBody(decompressed.toString('utf8'));
              } else {
                processBody(body.toString('utf8'));
              }
            });
          } else {
            // 非压缩响应直接处理
            processBody(body.toString('utf8'));
          }
        });

        // 移除原始Content-Length头，因为我们要修改内容
        delete res.getHeader('content-length');
        // 如果有压缩头，移除它，因为我们要发送未压缩的修改后内容
        delete res.getHeader('content-encoding');
        
        // 暂停原始响应流，防止默认发送
        proxyRes.pause();
        
        // 处理HTML内容的函数
        function processBody(html) {
          // 使用更全面的正则表达式替换所有可能的github.com链接形式
          const modifiedBody = html
            // 替换完整URL (https://, http://)
            .replace(/https?:\/\/github\.com\//g, 'https://gh.houheya.us.kg/')
            // 替换相对路径URL (/开头)
            .replace(/\/\/github\.com\//g, 'https://gh.houheya.us.kg/')
            // 替换没有协议的URL
            .replace(/github\.com\//g, 'gh.houheya.us.kg/')
            // 替换href属性中的链接
            .replace(/href=["']https?:\/\/github\.com([^"']*)["']/g, 'href="https://gh.houheya.us.kg$1"')
            .replace(/href=["']\/\/github\.com([^"']*)["']/g, 'href="https://gh.houheya.us.kg$1"')
            .replace(/href=["']\/(?!\/)[^"']*github\.com([^"']*)["']/g, 'href="https://gh.houheya.us.kg$1"')
            // 替换src属性中的链接
            .replace(/src=["']https?:\/\/github\.com([^"']*)["']/g, 'src="https://gh.houheya.us.kg$1"')
            .replace(/src=["']\/\/github\.com([^"']*)["']/g, 'src="https://gh.houheya.us.kg$1"')
            // 替换action属性中的链接
            .replace(/action=["']https?:\/\/github\.com([^"']*)["']/g, 'action="https://gh.houheya.us.kg$1"')
            .replace(/action=["']\/\/github\.com([^"']*)["']/g, 'action="https://gh.houheya.us.kg$1"');

          // 设置新的Content-Length
          res.setHeader('Content-Length', Buffer.byteLength(modifiedBody));
          // 发送修改后的内容
          res.end(modifiedBody);
        }
      } else {
        // 非HTML内容直接传递
        proxyRes.pipe(res);
      }
    },
    selfHandleResponse: true // 必须设置为true才能自定义响应处理
  })(req, res);
};
