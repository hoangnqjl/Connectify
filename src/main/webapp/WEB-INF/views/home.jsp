<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Interface</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/chat.css">
</head>
<body>
<div class="main-body">
    <div class="container-01">
        <div class="sidebar">
            <div class="sidebar-header">
                <h2>Connectify</h2>
                <button class="new-chat-btn">+ Create</button>
            </div>
            <div class="tabs">
                <button class="tab active">Messages</button>
                <button class="tab">Waiting</button>
            </div>
            <div class="chat-list">
                <!-- Dynamic chat list using JSTL -->
                <c:forEach var="chat" items="${chatList}">
                    <div class="chat-item ${chat.active ? 'active' : ''}">
                        <img src="${chat.avatarUrl}" alt="Avatar" class="avatar">
                        <div class="chat-info">
                            <h3>${chat.name}</h3>
                            <p>${chat.lastMessage} - ${chat.date}</p>
                        </div>
                    </div>
                </c:forEach>
                <!-- Static fallback if no data -->
                <c:if test="${empty chatList}">
                    <div class="chat-item active">
                        <img src="https://via.placeholder.com/40" alt="Avatar" class="avatar">
                        <div class="chat-info">
                            <h3>Hoang Nguyen</h3>
                            <p>Tin nhắn gần đây nhất - 29 Aug 2024</p>
                        </div>
                    </div>
                </c:if>
            </div>
            <div class="search-bar">
                <button class="search-btn">🔍 Search</button>
            </div>
        </div>
    </div>

    <div class="container-02">
        <!-- Chat Window -->
        <div class="chat-window">
            <div class="chat-header">
                <img src="${selectedChat.avatarUrl}" alt="Avatar" class="avatar">
                <h3>${selectedChat.name}</h3>
                <!-- Static fallback -->
                <c:if test="${empty selectedChat}">
                    <img src="https://via.placeholder.com/40" alt="Avatar" class="avatar">
                    <h3>Hoang Nguyen</h3>
                </c:if>
            </div>
            <div class="chat-body">
                <!-- Chat messages can be dynamically populated here -->
                <c:forEach var="message" items="${messages}">
                    <div class="message">
                        <p>${message.content}</p>
                        <span>${message.timestamp}</span>
                    </div>
                </c:forEach>
            </div>
            <div class="chat-footer">
                <button class="add-btn">+</button>
                <div class="chat-box">
                    <input type="text" placeholder="Send a message..." name="message">
                    <button class="send-btn">Send</button>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>