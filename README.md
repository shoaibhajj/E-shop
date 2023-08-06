E-shop 🛒
E-shop is a full-stack e-commerce web app that allows users to browse, buy, and sell products online. It is developed using Node.js and Express for the backend, and React.js for the frontend. It is deployed on Render and uses Stripe as a payment provider. 💳

Features ✨
E-shop supports user authentication and authorization using JSON Web Tokens (JWT) and bcrypt.
E-shop allows users to create, read, update, and delete products, categories, orders, reviews, and ratings using RESTful API endpoints.
E-shop provides search, filter, sort, and paginate functionalities for the products and categories.
E-shop integrates with Stripe to enable secure online payment using credit or debit cards.
E-shop uses Cloudinary to store and serve product images.
E-shop uses Mongoose as an object data modeling (ODM) library for MongoDB.
E-shop follows the MVC (Model-View-Controller) design pattern and uses async/await syntax for asynchronous operations.
Installation 💻
To run E-shop locally, you need to have the following tools installed:

Node.js 14 or higher ☕
MongoDB 🍃
npm 📦
Then, follow these steps:

Clone this repository: git clone https://github.com/shoaibhajj/E-shop.git 📥
Navigate to the project directory: cd E-shop 📂
Install the dependencies: npm install 🛠️
Create a .env file in the root directory and add the following environment variables:
NODE_ENV=development
PORT=5000
MONGO_URI=your mongodb uri
JWT_SECRET=your jwt secret
STRIPE_SECRET_KEY=your stripe secret key
CLOUDINARY_CLOUD_NAME=your cloudinary cloud name
CLOUDINARY_API_KEY=your cloudinary api key
CLOUDINARY_API_SECRET=your cloudinary api secret
Copy
Run the server: npm start 🚀
Usage 🖥️
Once the server is running, you can access the web app at http://localhost:5000. You can also access the API documentation at http://localhost:5000/api/docs.

To see the live version of the web app, visit https://e-shop-mpvq.onrender.com/.

To see the products in JSON format, visit https://e-shop-mpvq.onrender.com/api/v1/products.

License 📝
E-shop is licensed under the MIT License. See [LICENSE] file for more details.
