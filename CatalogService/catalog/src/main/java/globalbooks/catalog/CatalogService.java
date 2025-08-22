package com.globalbooks.catalog;

import jakarta.jws.WebMethod;
import jakarta.jws.WebParam;
import jakarta.jws.WebService;
import java.util.List;

@WebService(
    name = "CatalogService",
    targetNamespace = "http://catalog.globalbooks.com/"
)
public interface CatalogService {

    @WebMethod(operationName = "getProductById")
    Product getProductById(@WebParam(name = "productId") String productId);

    @WebMethod(operationName = "listProducts")
    List<Product> listProducts();

    @WebMethod(operationName = "searchProducts")
    List<Product> searchProducts(@WebParam(name = "keyword") String keyword);
}
