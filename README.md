# Inventory Management System

A modern **Inventory Management System** built with **Node.js, Express, MySQL, and Bootstrap**. This project provides a responsive web-based interface for managing stock, tracking inventory movements, and generating reports. It follows best practices in performance, security, and scalability.

## Notable Techniques

This project uses several advanced techniques to improve performance, usability, and maintainability:

- **[Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)**: Efficiently lazy-loads images and data tables for improved performance.
- **[CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout) & [Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)**: Creates a responsive and flexible layout.
- **[Debouncing](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#Debouncing) in JavaScript**: Optimizes search queries and form inputs.
- **Parameterized Queries in MySQL**: Prevents SQL injection vulnerabilities.
- **JWT Authentication**: Implements secure session management with JSON Web Tokens.

## Technologies & Libraries

Beyond standard tools, the project leverages:

- **[Bootstrap 5](https://getbootstrap.com/)**: Provides responsive UI components.
- **[Sequelize](https://sequelize.org/)**: Simplifies MySQL database interactions using an ORM.
- **[Dotenv](https://www.npmjs.com/package/dotenv)**: Manages environment variables securely.
- **[Express Validator](https://express-validator.github.io/docs/)**: Ensures data integrity in API requests.
- **[Font Awesome](https://fontawesome.com/)**: Includes scalable vector icons for UI elements.
- **[Google Fonts - Roboto](https://fonts.google.com/specimen/Roboto)**: Default typography for the application.

## Project Structure

```plaintext
📦 inventory-management-system
├── public/               # Static assets (CSS, JS, images)
│   ├── css/              # Stylesheets
│   ├── js/               # Client-side JavaScript
│   ├── images/           # Icons and product images
├── src/                  # Main backend source code
│   ├── controllers/      # Express route handlers
│   ├── models/           # Sequelize models for database tables
│   ├── routes/           # API and view routes
│   ├── middleware/       # Authentication and validation logic
├── views/                # Handlebars templates for frontend rendering
├── .env.example          # Example environment configuration
├── package.json          # Project dependencies and scripts
├── server.js             # Main application entry point
```

- **`public/`**: Holds frontend assets like stylesheets, JavaScript, and images.  
- **`src/`**: Contains the backend logic, including routing, authentication, and database models.  
- **`views/`**: Handlebars templates for rendering dynamic pages.  

