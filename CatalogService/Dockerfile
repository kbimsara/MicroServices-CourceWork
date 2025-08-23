FROM tomcat:10.1.12-jdk11-temurin-jammy

# Build stage
FROM maven:3.9.5-amazoncorretto-11 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean install -DskipTests

# Runtime stage
FROM tomcat:10.1.12-jdk11-temurin-jammy

COPY --from=build /app/target/CatalogService.war /usr/local/tomcat/webapps/

EXPOSE 8080

CMD ["catalina.sh", "run"]
