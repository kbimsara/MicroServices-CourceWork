package com.globalbooks.catalog;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "Product")
@XmlAccessorType(XmlAccessType.FIELD)
public class Product {

    @XmlElement
    private String id;

    @XmlElement
    private String name;

    @XmlElement
    private String description;

    @XmlElement
    private double price;

    public Product() {}

    public Product(String id, String name, String description, double price) {
        this.id = id; this.name = name; this.description = description; this.price = price;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
}
