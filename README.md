# travel-buddy

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Introduction

travel-buddy is a web application designed to assist users with travel planning. While the exact functionality is not fully described, the project leverages technologies like Flask for the backend, Google's Generative AI for potential AI-powered features, and utilizes CSS, JavaScript, and HTML for the frontend.

## Features

*   **Frontend:** Responsive design with a mobile menu.
*   **Backend:** Utilizes Flask for handling requests and responses.
*   **AI Integration:** Potentially integrates with Google's Generative AI for travel-related tasks.
*   **Speech Recognition:** Integrates with Google Cloud Speech-to-Text.

## Installation

To install and run travel-buddy, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>  # Replace <repository_url> with the actual URL
    cd travel-buddy
    ```

2.  **Set up a virtual environment (recommended):**

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Linux/macOS
    # venv\Scripts\activate  # On Windows
    ```

3.  **Install dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Set environment variables:**

    Ensure you have the necessary environment variables set for Google Cloud services, including `GOOGLE_CLOUD_PROJECT` and `GOOGLE_CLOUD_LOCATION`.  You may need to configure authentication for Google Cloud services.

5.  **Run the application:**

    ```bash
    python app.py
    ```

    The application will typically be accessible at `http://127.0.0.1:5000/` or a similar address.

## Usage

The application's usage will depend on the specific features implemented.  Here's a basic example of how to potentially interact with the application, based on the provided code snippets:

1.  **Access the web application:** Open a web browser and navigate to the address where the Flask application is running (e.g., `http://127.0.0.1:5000/`).

2.  **Interact with the chat interface (if applicable):**  If the application includes a chat interface (as suggested by `static/chat.js`), you would typically:
    *   Enter text into the input field.
    *   Click the "Send" button.
    *   View the responses in the chat window.
    *   Use suggestion chips for pre-defined queries.

3.  **Use the navigation (if applicable):**  If the application includes navigation (as suggested by `static/script.js`), you would:
    *   Click on navigation links.
    *   Use the mobile menu on smaller screens.

## Contributing

Contributions are welcome!  To contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them.
4.  Submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.