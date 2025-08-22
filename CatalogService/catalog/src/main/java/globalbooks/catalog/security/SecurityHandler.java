package com.globalbooks.catalog.security;

import jakarta.xml.namespace.QName;
import jakarta.xml.ws.handler.MessageContext;
import jakarta.xml.ws.handler.soap.SOAPHandler;
import jakarta.xml.ws.handler.soap.SOAPMessageContext;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.util.Set;

public class SecurityHandler implements SOAPHandler<SOAPMessageContext> {

    private static final String WSSE_NS = "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd";
    private static final QName SECURITY_QNAME = new QName(WSSE_NS, "Security");

    @Override
    public boolean handleMessage(SOAPMessageContext context) {
        Boolean outbound = (Boolean) context.get(MessageContext.MESSAGE_OUTBOUND_PROPERTY);
        if (Boolean.TRUE.equals(outbound)) {
            return true; // No checks on responses
        }
        try {
            var soapHeader = context.getMessage().getSOAPPart().getEnvelope().getHeader();
            if (soapHeader == null) {
                throw new SecurityException("Missing SOAP Header");
            }

            Element securityEl = null;
            NodeList headers = soapHeader.getChildNodes();
            for (int i = 0; i < headers.getLength(); i++) {
                if (headers.item(i) instanceof Element el) {
                    if (SECURITY_QNAME.getLocalPart().equals(el.getLocalName())
                        && WSSE_NS.equals(el.getNamespaceURI())) {
                        securityEl = el;
                        break;
                    }
                }
            }
            if (securityEl == null) {
                throw new SecurityException("Missing WS-Security header");
            }

            // Find UsernameToken
            NodeList utList = securityEl.getElementsByTagNameNS(WSSE_NS, "UsernameToken");
            if (utList.getLength() == 0) {
                throw new SecurityException("Missing UsernameToken");
            }
            Element ut = (Element) utList.item(0);
            String username = getChildText(ut, WSSE_NS, "Username");
            String password = getChildText(ut, WSSE_NS, "Password");

            if (!"admin".equals(username) || !"secret123".equals(password)) {
                throw new SecurityException("Invalid credentials");
            }
            return true;

        } catch (Exception e) {
            throw new SecurityException("WS-Security validation failed: " + e.getMessage(), e);
        }
    }

    private String getChildText(Element parent, String ns, String local) throws Exception {
        NodeList list = parent.getElementsByTagNameNS(ns, local);
        if (list.getLength() == 0) return null;
        return list.item(0).getTextContent();
    }

    @Override
    public boolean handleFault(SOAPMessageContext context) { return true; }

    @Override
    public void close(MessageContext context) {}

    @Override
    public Set<QName> getHeaders() {
        return Set.of(SECURITY_QNAME);
    }
}
