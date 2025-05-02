package com.qhoang.connectify.utils;

import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOServer;

public class SocketIOServerConfig {
    private SocketIOServer server;

    public SocketIOServerConfig() {
        Configuration config = new Configuration();
        config.setHostname("0.0.0.0");
        config.setPort(43);
        config.setOrigin("*");

        server = new SocketIOServer(config);

        // Sự kiện khi client kết nối
        server.addConnectListener(client -> {
            System.out.println("Client connected: " + client.getSessionId());
        });

        // Sự kiện khi client ngắt kết nối
        server.addDisconnectListener(client -> {
            System.out.println("Client disconnected: " + client.getSessionId());
        });

        // Sự kiện chat_message từ client
        server.addEventListener("chat_message", String.class, (client, data, ackSender) -> {
            System.out.println("Message from client: " + data);
            // Gửi lại tin nhắn cho tất cả client
            server.getBroadcastOperations().sendEvent("chat_message", data);
        });
    }

    public void startServer() {
        server.start();
        System.out.println("Socket.IO server started on port 9092");
    }

    public void stopServer() {
        server.stop();
        System.out.println("Socket.IO server stopped");
    }
}