package com.homeautomation.homeautomation.service;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.homeautomation.homeautomation.dto.home.CreateHomeRequest;
import com.homeautomation.homeautomation.dto.home.HomeResponse;
import com.homeautomation.homeautomation.dto.home.UpdateHomeRequest;
import com.homeautomation.homeautomation.entity.Home;
import com.homeautomation.homeautomation.entity.User;
import com.homeautomation.homeautomation.repository.HomeRepository;
import com.homeautomation.homeautomation.repository.UserRepository;

@Service
public class HomeService {

    private final HomeRepository homeRepository;
    private final UserRepository userRepository;

    public HomeService(
            HomeRepository homeRepository,
            UserRepository userRepository) {

        this.homeRepository = homeRepository;
        this.userRepository = userRepository;
    }

    // 1. Create Home
    @Transactional
    public HomeResponse createHome(
            CreateHomeRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                    )
                );

        Home home = new Home(
                request.getName().trim(),
                request.getAddress(),
                request.getDescription(),
                user
        );

        Home savedHome = homeRepository.save(home);

        return HomeResponse.from(savedHome);
    }

    // 2. Get all homes of logged-in user
    @Transactional(readOnly = true)
    public List<HomeResponse> getMyHomes(String email) {

        return homeRepository
                .findAllByUser_EmailOrderByCreatedAtDesc(email)
                .stream()
                .map(HomeResponse::from)
                .toList();
    }

    // 3. Get a specific home
    @Transactional(readOnly = true)
    public HomeResponse getHomeById(
            Long homeId,
            String email) {

        Home home = findUserHome(homeId, email);

        return HomeResponse.from(home);
    }

    // 4. Update Home
    @Transactional
    public HomeResponse updateHome(
            Long homeId,
            UpdateHomeRequest request,
            String email) {

        Home home = findUserHome(homeId, email);

        home.setName(request.getName().trim());
        home.setAddress(request.getAddress());
        home.setDescription(request.getDescription());

        Home updatedHome = homeRepository.save(home);

        return HomeResponse.from(updatedHome);
    }

    // 5. Delete Home
    @Transactional
    public void deleteHome(Long homeId, String email) {

        Home home = findUserHome(homeId, email);

        homeRepository.delete(home);
    }

    // Common ownership verification
    private Home findUserHome(Long homeId, String email) {

        return homeRepository
                .findByIdAndUser_Email(homeId, email)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Home not found"
                    )
                );
    }
}
