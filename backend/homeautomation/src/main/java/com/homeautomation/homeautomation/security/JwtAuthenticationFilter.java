package com.homeautomation.homeautomation.security;

import java.io.IOException;
import java.net.http.HttpHeaders;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.homeautomation.homeautomation.entity.User;
import com.homeautomation.homeautomation.repository.UserRepository;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component 
public class JwtAuthenticationFilter extends OncePerRequestFilter{

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

@Override 
protected  void doFilterInternal(
    HttpServletRequest request, HttpServletResponse response,
     FilterChain filterChain) throws ServletException, IOException{
        

        String header=request.getHeader("Authorization");

System.out.println("========== JWT DEBUG ==========");
System.out.println("Request Method: " + request.getMethod());
System.out.println("Request URI: " + request.getRequestURI());
System.out.println("Authorization Header Present: " + (header != null));
System.out.println("Bearer Token Present: " +
        (header != null && header.startsWith("Bearer ")));

        if(header == null || !header.startsWith("Bearer ")){
            filterChain.doFilter(request, response);
            return;
        }
        String token = header.substring(7);

        try{
            String email  = jwtService.extractUsername(token);

            if(email !=null && SecurityContextHolder.getContext()
                .getAuthentication() == null){
               
                User user = userRepository.findByEmail(email)
                .orElse(null);

                if(user != null && jwtService.isTokenValid(token, user.getEmail())){
                    var authorities = List.of(new SimpleGrantedAuthority(
                                     "ROLE_" + user.getRole().name()
                                    ));
                

                    var authentication =
                        new UsernamePasswordAuthenticationToken(
                                            user.getEmail(),
                                            null,
                                            authorities
                                    );
                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );
                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
System.out.println("JWT Authentication Successful");
System.out.println("Authenticated User: " + email);
                 }
            }


        }catch(JwtException | IllegalArgumentException ex){    
        // Invalid or expired JWT: do not authenticate the request.
            SecurityContextHolder.clearContext();
            System.out.println("JWT Authentication Failed");
        }
        filterChain.doFilter(request, response);
        
        System.out.println("Authentication Object: " +
        SecurityContextHolder.getContext().getAuthentication());

System.out.println("========== END JWT DEBUG ==========");
     }

}
