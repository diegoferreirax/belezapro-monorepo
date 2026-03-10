# Multi-stage Dockerfile: build with Gradle wrapper, run with OpenJDK 21
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /workspace

# Copy project files
COPY . /workspace

# Ensure the Gradle wrapper is executable and build the bootJar (skip tests for speed)
RUN chmod +x gradlew && ./gradlew -x test bootJar --no-daemon

FROM eclipse-temurin:21-jdk
WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /workspace/build/libs/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Allow passing JVM options via environment variable
ENV JAVA_OPTS="-Xms256m -Xmx512m"

# Run the Spring Boot jar
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
