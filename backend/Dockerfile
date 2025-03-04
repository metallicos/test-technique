# backend/Dockerfile
FROM php:8.2-apache

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    libicu-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    git \
    unzip \
    && docker-php-ext-install intl xml zip

# Install MongoDB extension for PHP via PECL
RUN pecl install mongodb && docker-php-ext-enable mongodb

# Enable Apache modules
RUN a2enmod rewrite

# Copy Composer from the official Composer image
COPY --from=composer:2.2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy your backend source code
COPY . .

# Install PHP dependencies (adjust flags as needed)
RUN composer install --no-interaction --prefer-dist

EXPOSE 80
CMD ["apache2-foreground"]
