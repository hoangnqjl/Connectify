package com.qhoang.connectify.utils;

import io.jsonwebtoken.*;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.util.Date;

@Configuration
public class JwtUtil {
    private final String SECRET_KEY = "wwAHaBDYO5q2LRs1InEvXCnB55lZUNkjeHya5PwFWI6YmvnkyGNJtortU1CeyIXd";

    public  String generateToken(String user_id) {
        return Jwts.builder()
                .setSubject(user_id)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 365))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
