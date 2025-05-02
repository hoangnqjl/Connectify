<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Signup - Connectify</title>
  <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/css/login.css">
</head>
<body>
<div class="login-container">
  <div class="login-box">
    <h2>Connectify</h2>
    <p>Join us today!</p>

    <c:if test="${not empty error}">
      <div class="error-message" id="errorMsg">
        <p>${error}</p>
      </div>
    </c:if>

    <form action="/signup" method="post" autocomplete="off">
      <div class="input-group">
        <span class="icon">
          <img class="icon" src="${pageContext.request.contextPath}/resources/icon/user.png">
        </span>
        <input type="text" name="fullname" placeholder="Full name..." required>
      </div>

      <div class="input-group">
        <span class="icon">
          <img class="icon" src="${pageContext.request.contextPath}/resources/icon/user.png">
        </span>
        <input type="text" name="username" placeholder="Username..." required>
      </div>

      <div class="input-group">
        <span class="icon">
          <img class="icon" src="${pageContext.request.contextPath}/resources/icon/email.png">
        </span>
        <input type="email" name="email" placeholder="Email address..." required>
      </div>

      <div class="input-group">
        <span class="icon">
          <img class="icon" src="${pageContext.request.contextPath}/resources/icon/phone.png">
        </span>
        <input type="text" name="phonenumber" placeholder="Phone number..." required>
      </div>

      <div class="input-group">
        <span class="icon">
          <img class="icon" src="${pageContext.request.contextPath}/resources/icon/password.png">
        </span>
        <input type="password" name="password" placeholder="Password..." required>
      </div>

      <div class="input-group">
        <span class="icon">
          <img class="icon" src="${pageContext.request.contextPath}/resources/icon/birthday.png">
        </span>
        <input type="date" name="birthday" required>
      </div>

      <button type="submit" class="login-btn">Sign Up</button>
    </form>

    <p class="signup-text"><a href="/login">Already have an account? Login!</a></p>
  </div>
</div>
</body>
</html>

