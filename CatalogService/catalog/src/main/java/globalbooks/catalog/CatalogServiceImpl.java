package com.globalbooks.catalog;

import jakarta.jws.HandlerChain;
import jakarta.jws.WebService;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@WebService(
    serviceName = "CatalogService",
    portName = "CatalogServicePort",
    endpointInterface = "com.globalbooks.catalog.CatalogService",
    targetNamespace = "http://catalog.globalbooks.com/"
)
@HandlerChain(file = "handler-chain.xml")
public class CatalogServiceImpl implements CatalogService {

    private static final List<Product> catalog = new ArrayList<>();

    static {
        catalog.add(new Product("P001", "Book A", "Intro to SOA", 19.99));
        catalog.add(new Product("P002", "Book B", "Microservices in Action", 29.99));
        catalog.add(new Product("P003", "Book C", "Cloud Deployment Guide", 39.99));
    }

    @Override
    public Product getProductById(String productId) {
        return catalog.stream()
                .filter(p -> p.getId().equalsIgnoreCase(productId))
                .findFirst()
                .orElse(null);
    }

    @Override
    public List<Product> listProducts() {
        return catalog;
    }

    @Override
    public List<Product> searchProducts(String keyword) {
        if (keyword == null || keyword.isBlank()) return catalog;
        String k = keyword.toLowerCase();
        return catalog.stream()
                .filter(p -> p.getName().toLowerCase().contains(k) ||
                             p.getDescription().toLowerCase().contains(k))
                .collect(Collectors.toList());
    }
}
