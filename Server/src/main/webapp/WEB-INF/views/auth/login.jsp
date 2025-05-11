<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - Connectify</title>
  <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/css/login.css">
</head>
<body>
<div class="login-container">
  <div class="login-box">
    <h2>Connectify</h2>
    <c:if test="${not empty errorMessage}">
      <div style="color: red;" id = "errorMsg">
        <p>${errorMessage}</p>
      </div>
    </c:if>

    <form action="auth/login" method="post" autocomplete="off">
      <input type="hidden" name="action" value="login">
      <div class="input-group">
        <span class="icon">
          <!-- pageScope.jsp -->
           <img class="icon" src="${pageContext.request.contextPath}/resources/icon/email.png">
        </span>
        <input type="email" id = "email" name="email" placeholder="Email address..." required autocomplete="off">
      </div>

      <div class="input-group">
        <span class="icon">
          <img class="icon" src="${pageContext.request.contextPath}/resources/icon/password.png">
        </span>
        <input type="password" id = "password" name="password" placeholder="Password..." required autocomplete="off">
      </div>

      <button type="submit" class="login-btn">Login</button>
    </form>

    <p class="signup-text"><a href="/signup">Sign up an account!</a></p>
  </div>
</div>
</body>
</html>

