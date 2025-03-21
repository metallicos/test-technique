
This repository contains a Next.js frontend and a Symfony backend. The backend uses API Platform with MongoDB (Doctrine ODM) to expose a REST API, while the frontend is built with Next.js, Tailwind CSS, and React. This document provides step-by-step instructions on setting up, running, and developing both projects.  

Overview  

Symfony Backend:  
The backend uses Symfony with API Platform to build a RESTful API. It connects to MongoDB using Doctrine ODM. It includes endpoints for user authentication, article creation, updating, and deletion.  

Next.js Frontend:  
The frontend is a modern React application built with Next.js and Tailwind CSS. It consumes the Symfony API for functionalities like displaying articles, authentication, and post management.  

Prerequisites  

Before setting up the project, ensure you have the following installed:  
- PHP 8.0+ (with required extensions for Symfony and MongoDB)  
- Composer for PHP package management  
- Node.js 21+ and npm (or yarn) for the Next.js project  
- MongoDB (local or remote)  
- Git  

Symfony Backend Setup  

1. Clone the Repository:  
git clone https://github.com/your-org/test-technique.git  
cd test-technique/backend  

2. Install Dependencies:  
composer install  
3. enerate JWT Token Keys:

Create a config/jwt directory:
mkdir -p config/jwt

Generate a private key (replace your_jwt_passphrase with your own):
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -pass pass:your_jwt_passphrase

Generate a public key:
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout -passin pass:your_jwt_passphrase

Update the .env.local file to include:
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your_jwt_passphrase

4. Environment Configuration:
Create a .env.local file in the backend directory and update these variables:
APP_ENV=dev
APP_DEBUG=1
DATABASE_URL=mongodb://localhost:27017/your_database_name
JWT_PASSPHRASE=your_jwt_passphrase

Set Up the Database:
Ensure your MongoDB server is running. Use MongoDB Compass or the command line to verify connectivity.

Load Test Data with Fixtures:




5. Run the Symfony Server:  
symfony server:start  

6. Access the API Platform Documentation:  
Open your browser and visit: http://localhost:8000/api  
This will display the Swagger UI with all available endpoints.  

Next.js Frontend Setup  
cd test-technique/frontend  

2. Install Dependencies:  
npm install (or using yarn: yarn install)  

3. Environment Configuration:  
Create a .env.local file in the frontend directory and add the following:  
NEXT_PUBLIC_API_URL=https://localhost:8000/api  

4. Start the Development Server:  
npm run dev  

5. Access the Frontend:  
Open your browser and navigate to: http://localhost:3000  

Running the Projects  

Backend:  
Ensure your MongoDB server is running, then start the Symfony server (see Symfony Backend Setup).  

Frontend:  
Start the Next.js development server (see Next.js Frontend Setup).  

Both projects run independently. Use separate terminal windows for the backend and the frontend.