    <script type="text/javascript">
        var socket = new WebSocket("_SOCKET_HOST_/");

        socket.onmessage = function(event) {
            if (event.data === "_MG_RELOAD_") {
                localStorage.setItem(_HOT_KEY_, window[_HOT_KEY_]);
                location.reload();    // 强制刷新页面
            }
        }
    </script>
