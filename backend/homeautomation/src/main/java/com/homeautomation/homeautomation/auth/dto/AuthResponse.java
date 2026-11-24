package com.homeautomation.homeautomation.auth.dto;

public record AuthResponse (
Long id,
String name,
String email,
String role,
String message,
// from here it is implemented  for issus a token
String accessToken,
String tokenType
){}
