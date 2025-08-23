package globalbooks.catalog;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final CatalogServiceImpl catalogService;

    public ProductController(CatalogServiceImpl catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return catalogService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable String id) {
        return catalogService.getProductById(id);
    }
}
