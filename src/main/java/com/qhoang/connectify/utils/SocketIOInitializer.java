package com.qhoang.connectify.utils;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import org.springframework.stereotype.Component;

@Component
public class SocketIOInitializer {
    private SocketIOServerConfig socketIOServerConfig;

    @PostConstruct
    public void init() {
        socketIOServerConfig = new SocketIOServerConfig();
        socketIOServerConfig.startServer();
    }

    @PreDestroy
    public void destroy() {
        socketIOServerConfig.stopServer();
    }
}