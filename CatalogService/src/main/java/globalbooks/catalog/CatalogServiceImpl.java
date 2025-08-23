package globalbooks.catalog;

// Removed @WebService annotation, CXF will publish the service via Spring configuration

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class CatalogServiceImpl implements CatalogService {

    private List<Product> products = new ArrayList<>(Arrays.asList(
            new Product("1", "The Lord of the Rings", "Fantasy novel by J.R.R. Tolkien", 25.00, 100),
            new Product("2", "Pride and Prejudice", "Romantic novel by Jane Austen", 15.50, 120),
            new Product("3", "1984", "Dystopian social science fiction novel by George Orwell", 12.00, 80),
            new Product("4", "To Kill a Mockingbird", "Novel by Harper Lee", 10.00, 150)
    ));

    @Override
    public Product getProductById(String productId) {
        return products.stream()
                .filter(product -> product.getId().equals(productId))
                .findFirst()
                .orElse(null);
    }

    @Override
    public List<Product> getAllProducts() {
        return new ArrayList<>(products);
    }
}
