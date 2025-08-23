package globalbooks.catalog.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private final UserDetailsService userDetailsService;

    public AuthController(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/token")
    public String createAuthenticationToken(@RequestBody AuthRequest authRequest) throws Exception {
        // In a real application, you would authenticate against a database
        // For this coursework, we use the in-memory user defined in SecurityConfig
        UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());

        if (userDetails.getPassword().equals(authRequest.getPassword())) {
            // Generate token with roles from UserDetails
            List<String> roles = userDetails.getAuthorities().stream()
                                    .map(grantedAuthority -> grantedAuthority.getAuthority())
                                    .collect(Collectors.toList());
            return JwtAuthFilter.generateToken(userDetails.getUsername(), roles, jwtSecret);
        } else {
            throw new Exception("Incorrect username or password");
        }
    }

    // Simple DTO for auth request
    static class AuthRequest {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
