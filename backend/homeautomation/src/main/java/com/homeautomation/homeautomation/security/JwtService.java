package com.homeautomation.homeautomation.security;

import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service 
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtService(@Value("${jwt.secret}") String secret,
        @Value("${jwt.expiration-ms}") long expirationMs){

        byte[] keyBytes = Decoders.BASE64.decode(secret);

        System.out.println("JWT secret length: " + keyBytes.length + " bytes");
        
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;

    }

    public String generateToken(String email){
        Instant now =Instant.now();
        Instant expiry =  now.plusMillis(expirationMs);

        return Jwts.builder()
        .subject(email)
        .issuedAt(Date.from(now))
        .expiration(Date.from(expiry))
        .signWith(signingKey)
        .compact();
        
    }
    public boolean isTokenValid(
            String token,
            String expectedUsername) {

        Claims claims = extractClaims(token);

        return expectedUsername.equals(claims.getSubject())
                && claims.getExpiration() != null
                && claims.getExpiration().after(new Date());

            }

  public String extractUsername(String token){
    return extractClaims(token).getSubject();
  }
  private Claims extractClaims(String token) {

        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
