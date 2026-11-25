package com.homeautomation.homeautomation.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.homeautomation.homeautomation.security.CustomUserDetailsService;
import com.homeautomation.homeautomation.security.JwtAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;


@Configuration 
public class SecurityConfig {

    // @Bean 
    // public SecurityFilterChain securityFilterChain(HttpSecurity http)throws Exception {
    //     http
    //     .csrf(csrf->csrf.disable())
    //     .cors(cors->{})
    //     .sessionManagement(session->session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    //     .authorizeHttpRequests(auth->
    //         auth.requestMatchers(
    //             HttpMethod.OPTIONS,"/**"
    //         ).permitAll() 
    //         .requestMatchers(
    //             "/api/auth/register",
    //             "/api/auth/login"
    //         ).permitAll()
    //         .anyRequest().authenticated()
    //     );
    //     return  http.build();
    // }

    @Bean 
    public PasswordEncoder passwordEncoder(){
        return  new BCryptPasswordEncoder();
    }
    

    @Bean 
    public AuthenticationProvider authenticationProvider(
        CustomUserDetailsService userDetailsService,
        PasswordEncoder passwordEncoder){
            DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
            provider.setPasswordEncoder(passwordEncoder);

            return provider;
    }


    @Bean 
    public SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        JwtAuthenticationFilter jwtFilter,
        AuthenticationProvider authenticationProvider
    )throws Exception {
        http
        .csrf(csrf->csrf.disable())
        .cors(cors->{})
        .sessionManagement(session->session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

        .authenticationProvider(authenticationProvider)
        
        .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, ex) -> response.sendError(
                                HttpServletResponse.SC_UNAUTHORIZED,
                                "Authentication required"))
        )
        .authorizeHttpRequests(auth -> auth.requestMatchers(
                HttpMethod.OPTIONS, "/**")
                .permitAll()
                .requestMatchers(
                        "/api/auth/register",
                        "/api/auth/login")
                .permitAll()
                .anyRequest().authenticated()
        )

        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return  http.build();
    }

    @Bean 
    public CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration configuration=new CorsConfiguration();

        configuration.setAllowedOrigins(
            List.of("http://localhost:5173",
                "https://homeorbit-three.vercel.app"
            )
        );
        configuration.setAllowedMethods(
            List.of(
                "GET","POST","PUT","PATCH","DELETE","OPTIONS"
            )
        );
        configuration.setAllowedHeaders(
            List.of(
                "Authorization","Content-Type"
            )
        );
        configuration.setAllowCredentials(false);
        
        UrlBasedCorsConfigurationSource source=
        new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
