# SNUTS.js: Sniffing Nasty Unit Test Smells in Javascript API

This API is designed to detect test smells in JavaScript codebases. It provides endpoints to analyze JavaScript test files and identify common test smells.

## Technologies Used

- Node.js
- Express.js
- JavaScript
- Yarn
- Babel
- Vitest


## Setup

To run this project locally, follow these steps:

1. Clone the repository:

   ```sh
   git clone https://github.com/Jhonatanmizu/SNUTS.js.git
   ```

2. Install dependencies:

   ```sh
   cd SNUTS.js
   yarn
   ```

3. Start the API server:

   ```sh
   yarn start
   ```

4. The API will be accessible at `http://localhost:3001`.

## Endpoints

### `POST /`

- **Description**: Detect test smells in JavaScript test files.
- **Request Body**:
  - `repository`: a public github repository which have jest or jasmine.
- **Response**:
  - `results`: Array of objects containing the detected test smells.

### `GET /health`

- **Description**: Check the health of the API.
- **Response**:
  - `status`: Status of the API (e.g., "OK").

## Usage

You can use the API to detect test smells in your JavaScript test files by sending a POST request to the `/detect` endpoint with the test files you want to analyze.

Example:

```sh
curl -X POST http://localhost:3000/ -H "Content-Type: application/json" -d '{"repository":"repo-url"}'
```

## Contributing

If you'd like to contribute to this project, please fork the repository and submit a pull request. You can also open an issue to report bugs or suggest new features.

---

Let me know if you need any further adjustments or additions!
