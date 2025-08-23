package globalbooks.catalog;

import jakarta.jws.WebMethod;
import jakarta.jws.WebParam;
import jakarta.jws.WebResult;
import jakarta.jws.WebService;

import java.util.List;

@WebService(targetNamespace = "http://catalog.globalbooks/", name = "CatalogServicePort")
public interface CatalogService {

    @WebMethod(operationName = "getProductById")
    @WebResult(name = "product")
    Product getProductById(@WebParam(name = "productId") String productId);

    @WebMethod(operationName = "getAllProducts")
    @WebResult(name = "product")
    List<Product> getAllProducts();
}
