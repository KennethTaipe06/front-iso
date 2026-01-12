const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    // Backend principal (documentos/auth) - local
    app.use(
        ['/api', '/auth'],
        createProxyMiddleware({
            target: 'http://127.0.0.1:8000',
            changeOrigin: true,
            secure: false,
            logLevel: 'warn',
        })
    );

    // Servicio de chat (RAG) - remoto
    app.use(
        '/chat',
        createProxyMiddleware({
            target: 'http://31.97.9.53:8001',
            changeOrigin: true,
            secure: false,
            logLevel: 'warn',
        })
    );
};
