function TWebChannel(port, onConnected) {
    var self = this;
    this.ws = null;

    var isHttps = window.location.protocol === "https:";
    var wsProtocol = isHttps ? "wss://" : "ws://";
    // Usa o host atual ou localhost dependendo de onde está rodando
    var wsHost = window.location.hostname || "127.0.0.1";

    var url = wsProtocol + wsHost + ":" + port;

    try {
        this.ws = new WebSocket(url);
        this.ws.onopen = function () {
            if (onConnected) onConnected();
        };
        this.ws.onmessage = function (event) {
            var data = JSON.parse(event.data);
            if (self.advplToJs) {
                self.advplToJs(data.codeType, data.content);
            }
        };
        this.ws.onerror = function (error) {
            console.error("Erro na conexao com TWebChannel:", error);
        };
    } catch (e) {
        console.error("Excecao ao criar WebSocket:", e);
    }

    this.jsToAdvpl = function (codeType, content) {
        if (self.ws && self.ws.readyState === WebSocket.OPEN) {
            var msg = JSON.stringify({
                codeType: codeType,
                content: content
            });
            self.ws.send(msg);
        } else {
            console.warn("WebSocket fechado. Enviando via postMessage de contingencia...");
            if (window.parent) {
                window.parent.postMessage({ codeType: codeType, content: content }, "*");
            }
        }
    };
}