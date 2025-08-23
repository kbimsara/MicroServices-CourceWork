package globalbooks.catalog.security;

import org.apache.wss4j.common.ext.WSPasswordCallback;

import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.callback.UnsupportedCallbackException;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class ServerPasswordCallback implements CallbackHandler {

    private Map<String, String> passwords = new HashMap<>();

    public ServerPasswordCallback() {
        passwords.put("clientuser", "clientpass");
        passwords.put("testuser", "testpass");
    }

    @Override
    public void handle(Callback[] callbacks) throws IOException, UnsupportedCallbackException {
        for (Callback callback : callbacks) {
            if (callback instanceof WSPasswordCallback) {
                WSPasswordCallback pc = (WSPasswordCallback) callback;
                String password = passwords.get(pc.getIdentifier());
                if (password != null) {
                    pc.setPassword(password);
                } else {
                    throw new UnsupportedCallbackException(callback, "unrecognized username: " + pc.getIdentifier());
                }
            } else {
                throw new UnsupportedCallbackException(callback, "Unsupported Callback Type");
            }
        }
    }
}
