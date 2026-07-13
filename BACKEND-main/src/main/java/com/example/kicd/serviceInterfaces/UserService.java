
package com.example.kicd.serviceInterfaces;

import com.example.kicd.DTOS.UserDTO;
import com.example.kicd.entities.User;

import java.util.List;

public interface UserService {

    User createUser(UserDTO dto);

    User getUser(Long id);

    List<User> getAllUsers();

    User updateUser(Long id, UserDTO dto);

    void deleteUser(Long id);
}
