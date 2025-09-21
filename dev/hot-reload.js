// 热重载客户端
const socket = io('' + window.location, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
  transports: ['websocket', 'polling']
});

socket.on('reload', function () {
    console.log('🔁 检测到文件更新，页面即将刷新...');
    location.reload();
});