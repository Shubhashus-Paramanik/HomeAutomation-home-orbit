
package com.homeautomation.homeautomation.dto;

import java.time.Instant;

public record ProfileResponse(
    Long id,
    String name,
    String email,
    String role,
    Instant createdAt
) {
}
