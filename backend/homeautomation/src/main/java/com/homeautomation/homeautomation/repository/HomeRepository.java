
package com.homeautomation.homeautomation.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.homeautomation.homeautomation.entity.Home;

public interface HomeRepository extends JpaRepository<Home, Long> {

    // Get all homes belonging to a particular user
    List<Home> findAllByUser_EmailOrderByCreatedAtDesc(String email);

    // Find a particular home belonging to a particular user
    Optional<Home> findByIdAndUser_Email(Long id, String email);

}
