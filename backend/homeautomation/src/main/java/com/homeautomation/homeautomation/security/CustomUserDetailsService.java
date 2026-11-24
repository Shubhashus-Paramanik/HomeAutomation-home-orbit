package com.homeautomation.homeautomation.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.homeautomation.homeautomation.entity.User;
import com.homeautomation.homeautomation.repository.UserRepository;

@Service 
public class CustomUserDetailsService implements UserDetailsService{

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository){
        this.userRepository=userRepository;
    }

    @Override 
    public UserDetails loadUserByUsername(String email)
        throws UsernameNotFoundException{

            User user= userRepository.findByEmail(
                email.trim().toLowerCase(java.util.Locale.ROOT))
                .orElseThrow(()->new UsernameNotFoundException("Invalid email or password"));
             
    return  org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
    .password(user.getPassword())
    .roles(user.getRole().name())
    .build();

    }

}
