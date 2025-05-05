<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Chat Interface</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/chat.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.4.0/socket.io.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.1/dist/js.cookie.min.js"></script>
</head>
<body>
<div class="main-body">
    <!-- Sidebar -->
    <div class="container-01">
        <div class="sidebar">
            <div class="sidebar-header">
                <h2>Connectify</h2>
                <button class="new-chat-btn" onclick="openUserListModal()">+ Create</button>
            </div>

            <div class="tabs">
                <button class="tab active">Messages</button>
                <button class="tab">Waiting</button>
            </div>

            <div class="chat-list">
                <c:choose>
                    <c:when test="${empty conversations}">
                        <div class="chat-item">
                            <img src="https://sm.ign.com/ign_pk/cover/a/avatar-gen/avatar-generations_rpge.jpg" alt="Avatar" class="avatar">
                            <div class="chat-info">
                                <h3>Không có cuộc trò chuyện</h3>
                                <p>Bạn chưa có cuộc trò chuyện nào.</p>
                            </div>
                        </div>
                    </c:when>
                    <c:otherwise>
                        <c:forEach var="chat" items="${conversations}" varStatus="status">
                            <c:set var="partner" value="${partners[status.index]}" />
                            <div class="chat-item" onclick="location.href='${pageContext.request.contextPath}/chat/conversations?selectedConId=${chat.con_id}'" style="cursor: pointer;">
                                <img src="<c:out value='${empty partner.avatar ? "https://sm.ign.com/ign_pk/cover/a/avatar-gen/avatar-generations_rpge.jpg" : partner.avatar}'/>" alt="Avatar" class="avatar">
                                <div class="chat-info">
                                    <h3><c:out value="${partner.fullname}" /></h3>
                                    <p><strong>Trạng thái: </strong><c:out value="${chat.status}" /></p>
                                </div>
                            </div>
                        </c:forEach>
                    </c:otherwise>
                </c:choose>
            </div>
        </div>

        <!-- Modal tạo cuộc trò chuyện -->
        <div id="userListModal" class="modal" style="display: none;">
            <div class="modal-content">
                <span class="close-btn" onclick="closeUserListModal()">&times;</span>
                <h2>Chọn người dùng để bắt đầu trò chuyện</h2>
                <c:forEach var="user" items="${users}">
                    <div class="user-item">
                        <p><strong>${user.fullname}</strong> (${user.username})</p>
                        <form action="${pageContext.request.contextPath}/chat/send" method="post" style="display:inline;">
                            <input type="hidden" name="receiverId" value="${user.user_id}">
                            <input type="hidden" name="content" value="Xin chào! Tôi muốn trò chuyện với bạn.">
                            <button type="submit">Chat</button>
                        </form>
                    </div>
                </c:forEach>
            </div>
        </div>
    </div>

    <!-- Chat window -->
    <div class="container-02">
        <div class="chat-window">
            <div class="chat-header">
                <img src="https://via.placeholder.com/40" alt="Avatar" class="avatar">
                <h3>
                    <c:choose>
                        <c:when test="${not empty selectedConId}">
                            Đoạn hội thoại: <c:out value="${selectedConId}" />
                        </c:when>
                        <c:otherwise>
                            Chọn một cuộc trò chuyện
                        </c:otherwise>
                    </c:choose>
                </h3>
            </div>

            <div class="chat-body" id="messageList">
                <c:choose>
                    <c:when test="${not empty messages}">
                        <c:set var="prevDate" value="" scope="page"/>
                        <c:forEach var="msg" items="${messages}">
                            <c:set var="currentDate" value="${fn:substring(msg.created_at, 0, 10)}"/>
                            <c:if test="${currentDate ne prevDate}">
                                <div class="date-divider">
                                        ${currentDate}
                                </div>
                                <c:set var="prevDate" value="${currentDate}" scope="page"/>
                            </c:if>

                            <div class="message">
                                <div class="sender-name">
                                    <c:out value="${userMap[msg.sender].fullname}" />
                                </div>
                                <div class="message-content">
                                    <p><c:out value="${msg.content}" /></p>
                                    <span class="timestamp">
                                        <c:out value="${fn:substring(msg.created_at, 11, 16)}" />
                                    </span>
                                </div>
                            </div>
                        </c:forEach>
                    </c:when>
                    <c:otherwise>
                        <p>Chưa có nội dung trò chuyện nào được chọn.</p>
                    </c:otherwise>
                </c:choose>
            </div>

            <div class="chat-footer">
                <form id="sendMessageForm" class="chat-box" onsubmit="sendMessage(event)">
                    <input type="hidden" name="receiverId" value="${receiverId}" />
                    <input type="text" placeholder="Send a message..." name="content" required>
                    <button class="send-btn" type="submit">Send</button>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- Scripts -->
<script>
    let jwt;
    if (document.cookie) {
        jwt = Cookies.get("jwt");
    }

    const socket = io('http://localhost:3000', {
        transports: ['websocket'],
    });


    socket.on('connect', () => {
        console.log('Đã kết nối tới server. Session ID:', socket.id);
        socket.emit('register', jwt, (response) => {
            if (response === 'success') {
                console.log('Đăng ký thành công!');
            } else if (response === 'unauthorized') {
                console.error('Đăng ký thất bại: Token không hợp lệ.');
            }
        });
    });


    socket.on('get_message', function(message) {
        console.log('Đã kết nối tới server. Session ID:', socket.id);
        console.log('📥 [Client] Nhận get_message từ người khác:', message);
        displayNewMessage(message);
    });

    socket.on('put_message', function(message) {
        console.log('📤 [Client] Nhận put_message từ chính mình:', message);
        displayNewMessage(message);
    });

    function displayNewMessage(message) {
        const messageList = document.getElementById("messageList");
        const newMessage = document.createElement("div");
        newMessage.classList.add("message");

        const senderName = document.createElement("div");
        senderName.classList.add("sender-name");
        senderName.textContent = message.sender;

        const messageContent = document.createElement("div");
        messageContent.classList.add("message-content");

        const messageText = document.createElement("p");
        messageText.textContent = message.content;

        const timestamp = document.createElement("span");
        timestamp.classList.add("timestamp");
        timestamp.textContent = message.created_at; // ✅ sửa lại

        messageContent.appendChild(messageText);
        messageContent.appendChild(timestamp);
        newMessage.appendChild(senderName);
        newMessage.appendChild(messageContent);

        messageList.appendChild(newMessage);
    }

    function sendMessage(event) {
        event.preventDefault();
        const form = event.target;
        const content = form.querySelector('input[name="content"]').value;
        const receiverId = form.querySelector('input[name="receiverId"]').value;

        fetch('/chat/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                receiverId: receiverId,
                content: content
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Lỗi khi gửi:", data.error);
                    return;
                }

                // Không cần socket.emit nữa vì server đã gửi lại socket
                form.querySelector('input[name="content"]').value = "";
            })
            .catch(error => {
                console.error("Lỗi khi gửi tin nhắn:", error);
            });
    }

    function openUserListModal() {
        document.getElementById("userListModal").style.display = "block";
    }

    function closeUserListModal() {
        document.getElementById("userListModal").style.display = "none";
    }
</script>


</body>
</html>
