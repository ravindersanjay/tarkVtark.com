# Use Java 17 (recommended for Spring Boot)
FROM eclipse-temurin:17-jdk-alpine

# Set working directory inside container
WORKDIR /app

# Copy backend source code into container
COPY . .

# Make mvnw executable and build the app
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Expose Spring Boot default port
EXPOSE 8080

# Run the Spring Boot jar
CMD ["java", "-jar", "target/*.jar"]
