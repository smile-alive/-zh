<p align="center">
  <img src="https://raw.github.com/http-party/node-http-proxy/master/doc/logo.png"/>
</p>

# node-http-proxy

`node-http-proxy` 是一个支持 WebSocket 的可编程 HTTP 代理库。它适用于实现反向代理和负载均衡器等组件。

### 目录

-   [安装](#安装)
-   [从 0.8.x 升级？](#从-08x-升级)
-   [核心概念](#核心概念)
-   [使用案例](#使用案例)
    -   [设置一个基本的独立代理服务器](#设置一个基本的独立代理服务器)
    -   [设置一个带有自定义服务器逻辑的独立代理服务器](#设置一个带有自定义服务器逻辑的独立代理服务器)
    -   [设置一个带有代理请求头重写的独立代理服务器](#设置一个带有代理请求头重写的独立代理服务器)
    -   [修改来自代理服务器的响应](#修改来自代理服务器的响应)
    -   [设置一个带有延迟的独立代理服务器](#设置一个带有延迟的独立代理服务器)
    -   [使用 HTTPS](#使用-https)
    -   [代理 WebSockets](#代理-websockets)
-   [参数选项](#参数选项)
-   [监听代理事件](#监听代理事件)
-   [关闭](#关闭)
-   [其他](#其他)
    -   [测试](#测试)
    -   [ProxyTable API](#proxytable-api)
    -   [标志](#标志)

### 安装

`npm install http-proxy --save`

**[返回目录](#目录)**

### 从 0.8.x 升级？

点击 [这里](https://github.com/http-party/node-http-proxy/blob/master/UPGRADING.md)

**[返回目录](#目录)**

### 核心概念

通过调用 `createProxyServer` 并传递一个 `options` 对象作为参数来创建一个新的代理（[有效属性在此处](https://github.com/http-party/node-http-proxy/blob/master/lib/http-proxy.js#L26-L42)）

```javascript
var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer(options); // 参见 (†)
```

† 除非在对象上调用 `listen(..)`，否则这不会创建一个 web 服务器。见下文。

将返回一个带有四个方法的对象：

-   web `req, res, [options]`（用于代理常规 HTTP(S) 请求）
-   ws `req, socket, head, [options]`（用于代理 WS(S) 请求）
-   listen `port`（一个将对象包装在 web 服务器中的函数，为了您的方便）
-   close `[callback]`（一个关闭内部 web 服务器并停止侦听给定端口的函数）

然后可以通过调用这些函数来代理请求：

```javascript
http.createServer(function (req, res) {
	proxy.web(req, res, { target: 'http://mytarget.com:8080' });
});
```

可以通过事件发射器来监听错误：

```javascript
proxy.on('error', function(e) {
  ...
});
```

或者使用回调

```javascript
proxy.web(req, res, { target: 'http://mytarget.com:8080' }, function(e) { ... });
```

当请求被代理时，它遵循两个不同的管道 ([在这里可用](https://github.com/http-party/node-http-proxy/tree/master/lib/http-proxy/passes))，这两个管道都会对 `req` 和 `res` 对象应用变换。
第一个管道（进来的）负责创建和操作从客户端到目标的流，第二个管道（出去的）负责创建和操作从目标返回数据到客户端的流。

**[返回目录](#目录)**

### 使用案例

#### 设置一个基本的独立代理服务器

```js
var http = require('http'),
	httpProxy = require('http-proxy');
//
// 创建代理服务器并在选项中设置目标。
//
httpProxy.createProxyServer({ target: 'http://localhost:9000' }).listen(8000); // 参见 (†)

//
// 创建目标服务器
//
http.createServer(function (req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.write('request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2));
	res.end();
}).listen(9000);
```

† 调用 listen(..) 会触发创建一个 web 服务器。否则，只会创建代理实例。

**[返回目录](#目录)**

#### 设置一个带有自定义服务器逻辑的独立代理服务器

此示例演示了如何使用自己的 HTTP 服务器代理请求，同时您还可以在处理请求时添加自己的逻辑。

```js
var http = require('http'),
	httpProxy = require('http-proxy');

//
// 创建一个具有自定义应用程序逻辑的代理服务器
//
var proxy = httpProxy.createProxyServer({});

//
// 创建自定义服务器，并仅调用 `proxy.web()` 来代理一个请求
// 到选项中传递的目标
// 您还可以使用 `proxy.ws()` 来代理一个 WebSockets 请求
//
var server = http.createServer(function (req, res) {
	// 在此定义您自己的处理请求的逻辑，然后代理请求。
	proxy.web(req, res, { target: 'http://127.0.0.1:5050' });
});

console.log('listening on port 5050');
server.listen(5050);
```

**[返回目录](#目录)**

#### 设置一个带有代理请求头重写的独立代理服务器

此示例演示了如何使用自己的 HTTP 服务器代理请求，并通过添加特殊标头修改传出的代理请求。

```js
var http = require('http'),
	httpProxy = require('http-proxy');

//
// 创建一个具有自定义应用逻辑的代理服务器
//
var proxy = httpProxy.createProxyServer({});

// 要在数据发送之前修改代理连接，您可以监听
// 'proxyReq' 事件。当事件触发时，将接收以下参数：
// （http.ClientRequest proxyReq，http.IncomingMessage req，
// http.ServerResponse res，Object options）。当需要在代理连接
// 发送到目标之前修改代理请求时，此机制非常有用。
//
proxy.on('proxyReq', function (proxyReq, req, res, options) {
	proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
});

var server = http.createServer(function (req, res) {
	// 在此处定义您的自定义逻辑来处理请求
	// 然后代理请求。
	proxy.web(req, res, {
		target: 'http://127.0.0.1:5050'
	});
});

console.log('listening on port 5050');
server.listen(5050);
```

**[返回目录](#目录)**

#### 修改来自代理服务器的响应

有时，当您从原始服务器收到 HTML/XML 文档时，您可能希望在将其转发之前对其进行修改。

[Harmon](https://github.com/No9/harmon) 允许您以流式方式进行修改，以将对代理的压力降到最低。

**[返回目录](#目录)**

#### 设置一个带有延迟的独立代理服务器

```js
var http = require('http'),
	httpProxy = require('http-proxy');

//
// 创建带有延迟的代理服务器
//
var proxy = httpProxy.createProxyServer();

//
// 创建一个执行需要一些时间的操作的服务器
// 然后代理请求
//
http.createServer(function (req, res) {
	// 这模拟了需要 500 毫秒来执行的操作
	setTimeout(function () {
		proxy.web(req, res, {
			target: 'http://localhost:9008'
		});
	}, 500);
}).listen(8008);

//
// 创建目标服务器
//
http.createServer(function (req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.write(
		'request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 2)
	);
	res.end();
}).listen(9008);
```

**[返回目录](#目录)**

#### 使用 HTTPS

您可以激活对目标连接的安全 SSL 证书的验证（避免自签名证书），只需在选项中设置 `secure: true` 。

##### HTTPS -> HTTP

```js
//
// 在 HTTP 服务器前创建 HTTPS 代理服务器
//
httpProxy
	.createServer({
		target: {
			host: 'localhost',
			port: 9009
		},
		ssl: {
			key: fs.readFileSync('valid-ssl-key.pem', 'utf8'),
			cert: fs.readFileSync('valid-ssl-cert.pem', 'utf8')
		}
	})
	.listen(8009);
```

##### HTTPS -> HTTPS

```js
//
// 创建监听端口为 443 的代理服务器
//
httpProxy
	.createServer({
		ssl: {
			key: fs.readFileSync('valid-ssl-key.pem', 'utf8'),
			cert: fs.readFileSync('valid-ssl-cert.pem', 'utf8')
		},
		target: 'https://localhost:9010',
		secure: true // 根据您的需求，可以是 false。
	})
	.listen(443);
```

##### HTTP -> HTTPS (使用 PKCS12 客户端证书)

```js
//
// 创建带有 HTTPS 目标的 HTTP 代理服务器
//
httpProxy
	.createProxyServer({
		target: {
			protocol: 'https:',
			host: 'my-domain-name',
			port: 443,
			pfx: fs.readFileSync('path/to/certificate.p12'),
			passphrase: 'password'
		},
		changeOrigin: true
	})
	.listen(8000);
```

**[返回目录](#目录)**

#### 代理 WebSockets

您可以在选项中使用 `ws:true` 激活对代理的 WebSocket 支持。

```js
//
// 创建用于 WebSockets 的代理服务器
//
httpProxy
	.createServer({
		target: 'ws://localhost:9014',
		ws: true
	})
	.listen(8014);
```

您还可以通过调用 `ws(req, socket, head)` 方法代理 WebSocket 请求。

```js
//
// 设置我们的服务器来代理标准的 HTTP 请求
//
var proxy = new httpProxy.createProxyServer({
	target: {
		host: 'localhost',
		port: 9015
	}
});
var proxyServer = http.createServer(function (req, res) {
	proxy.web(req, res);
});

//
// 监听 `upgrade` 事件并代理 WebSocket 请求。
//
proxyServer.on('upgrade', function (req, socket, head) {
	proxy.ws(req, socket, head);
});

proxyServer.listen(8015);
```

**[返回目录](#目录)**

### 参数选项

`httpProxy.createProxyServer` 支持以下选项：

-   **target**: 要解析的 URL 字符串
-   **forward**: 要解析的 URL 字符串
-   **agent**: 传递给 http(s).request 的对象 (参见 Node 的 [https agent](http://nodejs.org/api/https.html#https_class_https_agent) 和 [http agent](http://nodejs.org/api/http.html#http_class_http_agent) 对象)
-   **ssl**: 传递给 https.createServer() 的对象
-   **ws**: true/false，如果要代理 WebSockets
-   **xfwd**: true/false，添加 x-forward 标头
-   **secure**: true/false，如果要验证 SSL 证书
-   **toProxy**: true/false，将绝对 URL 作为 `path` 传递（用于代理到代理）
-   **prependPath**: true/false，默认：true - 指定是否要将目标的路径前缀添加到代理路径
-   **ignorePath**: true/false，默认：false - 指定是否要忽略传入请求的代理路径（注意：如果需要，您必须附加/手动）。
-   **localAddress**: 本地接口字符串，用于传出连接
-   **changeOrigin**: true/false，默认：false - 将 host 标头的源更改为目标 URL
-   **preserveHeaderKeyCase**:true/false，默认：false - 指定是否要保留响应标头的 key 大小写
-   **auth**: 基本身份验证，例如 'user:password' 以计算授权标头。
-   **hostRewrite**: 改写 (201/301/302/307/308) 重定向中的位置主机名。
-   **autoRewrite**: 根据请求的主机/端口，改写 (201/301/302/307/308) 重定向的位置主机/端口。默认值：false。
-   **protocolRewrite**: 将 (201/301/302/307/308) 重定向的位置协议改写为 'http' 或 'https'。默认值：null。
-   **cookieDomainRewrite**: 改写 `set-cookie` 标头的域。可能的值：
    -   `false`（默认值）：禁用 cookie 重写
    -   `String`: 新的域，例如 `cookieDomainRewrite: "new.domain"`。要删除路径，请使用 `cookieDomainRewrite: ""`。
    -   `Object`: 域到新域的映射，使用 `"*"` 匹配所有域。
        例如，保持一个域不变，重写一个域并删除其他域：
        ```js
        cookieDomainRewrite: {
          "unchanged.domain": "unchanged.domain",
          "old.domain": "new.domain",
          "*": ""
        }
        ```
-   **cookiePathRewrite**: 改写 `set-cookie` 标头的路径。可能的值：
    -   `false`（默认值）：禁用 cookie 重写
    -   `String`: 新路径，例如 `cookiePathRewrite: "/newPath/"`。要删除路径，请使用 `cookiePathRewrite: ""`。要将路径设置为根，请使用 `cookiePathRewrite: "/"`。
    -   `Object`: 将路径重写为新路径，使用 `"*"` 匹配所有路径。
        例如，保持一个路径不变，重写一个路径并删除其他路径：
        ```js
        cookiePathRewrite: {
          "/unchanged.path/": "/unchanged.path/",
          "/old.path/": "/new.path/",
          "*": ""
        }
        ```
-   **headers**: 附加到目标请求的额外标头对象。
-   **proxyTimeout**: 传出代理请求的超时时间（毫秒）
-   **timeout**: 传入请求的超时时间（毫秒）
-   **followRedirects**: true/false，默认：false - 指定是否要跟随重定向
-   **selfHandleResponse** true/false，如果设置为 true，则不会调用任何 webOutgoing 传递，您需要在代理服务器上监听并根据 `proxyRes` 事件适当返回响应
-   **buffer**: 要发送为请求主体的数据流。可能存在一些中间件会在将其代理到代理之前消耗请求流，例如，如果您将请求的主体读入名为 'req.rawbody' 的字段中，可以在缓冲选项中重新流式化此字段：

    ```js
    'use strict';
    
    const streamify = require('stream-array');
    const HttpProxy = require('http-proxy');
    const proxy = new HttpProxy();
    
    module.exports = (req, res, next) => {
    	proxy.web(
    		req,
    		res,
    		{
    			target: 'http://localhost:4003/',
    			buffer: streamify(req.rawBody)
    		},
    		next
    	);
    };
    ```

**注意:**
`options.ws` 和 `options.ssl` 是可选的。
`options.target` 和 `options.forward` 不能都为空。

如果您正在使用 `proxyServer.listen` 方法，还适用以下选项：

-   **ssl**: 传递给 https.createServer() 的对象
-   **ws**: true/false，如果要代理 WebSockets

**[返回目录](#目录)**

### 监听代理事件

-   `error`: 如果与目标的请求失败，则会发出错误事件。 **我们不对在客户端和代理之间传递的消息以及在代理和目标之间传递的消息进行任何错误处理，因此建议您监听错误并处理它们。**
-   `proxyReq`: 在发送数据之前触发此事件。它使您有机会修改 proxyReq 请求对象。适用于 "web" 连接。
-   `proxyReqWs`: 在发送数据之前触发此事件。它使您有机会修改 proxyReq 请求对象。适用于 "websocket" 连接。
-   `proxyRes`: 如果向目标发送的请求收到响应，则会触发此事件。
-   `open`: 此事件在代理 WebSocket 被创建并传送到目标 WebSocket 时触发。
-   `close`: 此事件在代理 WebSocket 被关闭时触发。
-   （已弃用）`proxySocket`: 已弃用，使用 `open`。

```js
var httpProxy = require('http-proxy');
// 错误示例
//
// 具有错误目标的 Http 代理服务器
//
var proxy = httpProxy.createServer({
	target: 'http://localhost:9005'
});

proxy.listen(8005);

//
// 在 `proxy` 上监听 `error` 事件。
proxy.on('error', function (err, req, res) {
	res.writeHead(500, {
		'Content-Type': 'text/plain'
	});

	res.end('出现错误。我们正在报告自定义错误消息。');
});

//
// 在 `proxy` 上监听 `proxyRes` 事件。
//
proxy.on('proxyRes', function (proxyRes, req, res) {
	console.log('从目标接收的原始响应', JSON.stringify(proxyRes.headers, true, 2));
});

//
// 在 `proxy` 上监听 `open` 事件。
//
proxy.on('open', function (proxySocket) {
	// 在此处监听来自目标的消息
	proxySocket.on('data', hybiParseAndLogMessage);
});

//
// 在 `proxy` 上监听 `close` 事件。
//
proxy.on('close', function (res, socket, head) {
	// 查看已断开的 WebSocket 连接
	console.log('客户端已断开连接');
});
```

**[返回目录](#目录)**

### 关闭

-   在另一个程序中测试或运行服务器时，可能需要关闭代理。
-   这将阻止代理接受新连接。

```js
var proxy = new httpProxy.createProxyServer({
	target: {
		host: 'localhost',
		port: 1337
	}
});

proxy.close();
```

**[返回目录](#目录)**

### 其他

如果您想在收到 `proxyRes` 后处理自己的响应，可以使用 `selfHandleResponse` 进行处理。正如您在下面看到的，如果您使用此选项，您可以拦截并读取 `proxyRes`，但您也必须确保回复 `res` 本身，否则原始客户端将永远不会接收到任何数据。

### 修改响应

```js
var option = {
	target: target,
	selfHandleResponse: true
};
proxy.on('proxyRes', function (proxyRes, req, res) {
	var body = [];
	proxyRes.on('data', function (chunk) {
		body.push(chunk);
	});
	proxyRes.on('end', function () {
		body = Buffer.concat(body).toString();
		console.log('res from proxied server:', body);
		res.end('my response to cli');
	});
});
proxy.web(req, res, option);
```

#### 测试

在测试中，您可能希望模拟代理而不是使用端口 80 或 443。

```js
// 添加您自己的测试服务器
var testServer = http.createServer(function (req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.write(
		'request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 2)
	);
	res.end();
});
testServer.listen(9000);

// 为测试创建代理服务器
var httpProxy = require('../lib/http-proxy.js');
var proxy = httpProxy.createServer({ target: 'http://localhost:9000' }).listen(8000);
```

#### ProxyTable API

用于插入自定义规则和进行中间件处理的表格。

```js
proxy.on('proxyReq', function (proxyReq, req, res, options) {
	// 您可以在这里添加自定义请求标头
	proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
});

var proxyTable = {
	'/foo': {
		target: 'http://localhost:9000'
	},
	'/bar/baz': {
		target: 'http://localhost:9001',
		router: {
			'/bar': 'http://localhost:9002', // 路径重写
			'/baz': 'http://localhost:9003' // 路径重写
		}
	}
};

var proxy = httpProxy.createProxyServer({
	target: 'http://localhost:8080',
	proxyTable
});

proxy.listen(5050);
```

#### 标志

标志通常用于开发/测试，用于在启动时配置代理。使用标志的示例：

```bash
node examples/server.js --target http://localhost:8000 --port 5050
```

然后在您的服务器中：

```js
#!/usr/bin/env node
var http = require('http');
var httpProxy = require('http-proxy');

httpProxy.createProxyServer({ target: process.env.TARGET }).listen(process.env.PORT);
```
