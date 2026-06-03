# APIVerse 

APIVerse is a modern API testing and inspection tool inspired by Postman. It allows developers to build HTTP requests, test REST APIs, inspect responses, and generate cURL commands through a clean and intuitive interface.

## Features

### Request Builder
- Support for GET, POST, PUT, DELETE, PATCH requests
- Query Parameters editor
- Custom Headers editor
- Authentication support
  - Bearer Token
  - API Key
  - Basic Authentication
- Request Body editor
- Auto-generated cURL commands

### Response Inspector
- Pretty JSON view
- Raw response view
- Tree view for nested JSON
- Response headers viewer
- Status code indicators
- Response time measurement
- Response size measurement

### Utilities
- Copy response to clipboard
- Download response as JSON
- JSON syntax highlighting
- Interactive JSON tree explorer

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6 Modules)

## Project Structure

text src/ ├── components/ │   ├── RequestBuilder.js │   └── ResponseInspector.js │ ├── utils/ │   └── helpers.js │ └── main.js 

## How It Works

1. Enter an API endpoint URL.
2. Configure query parameters, headers, authentication, and request body.
3. Send the request.
4. Inspect the response using multiple viewing modes.
5. Copy or download the response data.

## Key Concepts Demonstrated

- ES6 Classes
- JavaScript Modules
- Fetch API
- DOM Manipulation
- Event Handling
- JSON Processing
- Component-Based Architecture
- Separation of Concerns

## Future Enhancements

- Request History
- Collections
- Environment Variables
- GraphQL Support
- WebSocket Testing
- Dark/Light Theme Toggle
- API Documentation Viewer



## Installation

 git clone https://github.com/Udayteja10/APIVerse.git
 
 cd APIVerse 

Open index.html in your browser or serve the project using a local development server.
