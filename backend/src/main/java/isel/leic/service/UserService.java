package isel.leic.service;

import isel.leic.exception.DuplicateResourceException;
import isel.leic.exception.UserNotFoundException;
import isel.leic.model.Group;
import isel.leic.model.User;
import isel.leic.repository.GroupRepository;
import isel.leic.repository.UserRepository;
import isel.leic.utils.AuthorizationUtils;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@ApplicationScoped
public class UserService {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserService.class);

    @Inject
    UserRepository userRepository;


    @Inject
    GroupRepository groupRepository;

    public User findById(Long id) {
        LOGGER.info("Fetching user by id: {}", id);
        return userRepository.findById(id);
    }

    public User findByUsername(String username){
        Optional<User> userOptional = userRepository.findByUsername(username);
        return userOptional.orElse(null);
    }
    public Optional<List<User>> findByUsernamePrefix(String prefix) {
        LOGGER.info("Searching for users with username prefix: {}", prefix);
        return userRepository.findByUsernamePrefix(prefix);
    }
    public boolean existsById(Long id) {
        LOGGER.info("Checking if user exists with id: {}", id);
        return userRepository.findById(id) != null;
    }

    public List<User> findAll() {
        LOGGER.info("Fetching all users");
        List<User> users = userRepository.listAll();
        LOGGER.info("Fetched {} users", users.size());
        return users;
    }

    @Transactional
    public User updatePassword(Long userId, String password) {
        if (userId == null || password == null) {
            throw new IllegalArgumentException("User ID and password cannot be null");
        }

        User user = userRepository.findById(userId);
        if (user == null) {
            throw new UserNotFoundException("User with ID " + userId + " not found");
        }

        user.setPassword(AuthorizationUtils.encodePassword(password));
        userRepository.persist(user);
        LOGGER.info("Updated password for user with ID {} ", user.getId());
        return user;
    }

    @Transactional
    public User createUser(User user) {
        LOGGER.info("Persisting user: {}", user.getUsername());
        user.setPassword(AuthorizationUtils.encodePassword(user.getPassword()));
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new DuplicateResourceException("User already exists");
        }
        userRepository.persist(user);
        return user;
    }

    @Transactional
    public void removeUser(Long userId) throws IllegalArgumentException {
        LOGGER.info("Removing user: {}", userId);

        User user = userRepository.findById(userId);
        if (user == null) {
            LOGGER.warn("User not found: {}", userId);
            throw new UserNotFoundException("User with ID " + userId + " not found");
        }

        userRepository.deleteById(userId);
        LOGGER.info("User {} removed successfully", userId);
    }

    public User authenticate(String username, String password) {
        LOGGER.info("Authenticating user: {}", username);

        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (AuthorizationUtils.verifyPassword(password,user.getPassword())) {
                LOGGER.info("User {} authenticated successfully", username);
                return user;
            } else {
                LOGGER.info("User {} authentication failed: Incorrect password", username);
                throw new IllegalArgumentException("Incorrect password for user: " + username);
            }
        } else {
            LOGGER.info("User {} authentication failed: User not found", username);
            throw new UserNotFoundException("User not found- " + username);
        }
    }



    public List<Group> findUserGroups(Long userId) {
        LOGGER.info("Finding groups for user with id '{}'", userId);

        User user = userRepository.findById(userId);
        if (user == null) {
            LOGGER.error("User with id '{}' not found", userId);
            throw new UserNotFoundException("User with ID " + userId + " not found");
        }

        Optional<List<Group>> userGroupsOptional = groupRepository.findByCreatorId(userId);
        List<Group> userGroups = userGroupsOptional.orElse(Collections.emptyList());

        if (userGroups.isEmpty()) {
            LOGGER.info("No groups found for user with id '{}'", userId);
        } else {
            LOGGER.info("Found {} group(s) for user with id '{}'", userGroups.size(), userId);
        }

        return userGroups;
    }



}
