# URL Shortener API with Analytics

![Status](https://img.shields.io/badge/status-live-success)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A simple, robust, and scalable URL shortener API built with Node.js and Express. It converts long URLs into short, easy-to-share links and tracks the number of clicks for each link. The backend is powered by a persistent, cloud-based SQLite database using Turso.

---
## ## Live API Endpoint

The API is live and ready to use. The base URL for all requests is:

**`https://landing-in.onrender.com`**

---
## ## Features

* **Shorten URLs:** Quickly generate a unique, 8-character short ID for any valid URL.
* **Click Tracking:** Automatically counts every time a short link is used.
* **Fast Redirects:** Instantly redirects users from the short link to the original destination.
* **Persistent Storage:** Uses a Turso cloud database to ensure data is never lost.
* **CORS Enabled:** Can be called directly from any web application.

---
## ## Technology Stack

* **Backend:** Node.js, Express.js
* **Database:** Turso (libSQL/SQLite)
* **Deployment:** Render
* **ID Generation:** Node.js `crypto` module

---
## ## API Documentation

### ### 1. Generate a Short URL

Creates a new short link for a given long URL.

* **Method:** `POST`
* **Endpoint:** `/generateshorturl`

#### #### Request Body
The body must be a JSON object with a single `longUrl` key.

| Field     | Type   | Description                | Required |
| :-------- | :----- | :------------------------- | :------- |
| `longUrl` | String | The original URL to shorten. | Yes      |

#### #### Request Examples

**cURL:**
```bash
curl -X POST https://landing-in.onrender.com/generateshorturl \
-H "Content-Type: application/json" \
-d '{"longUrl": "https://developers.googleblog.com/en/veo-3-and-veo-3-fast-new-pricing-new-configurations-and-better-resolution/"}'
```

**JavaScript Fetch:**
```javascript
const response = await fetch('https://landing-in.onrender.com/generateshorturl', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ longUrl: 'https://developers.googleblog.com/en/veo-3-and-veo-3-fast-new-pricing-new-configurations-and-better-resolution/' })
});
const data = await response.json();
console.log(data);
```

#### #### Success Response (`201 Created`)
```json
{
    "longUrl": "https://developers.googleblog.com/en/veo-3-and-veo-3-fast-new-pricing-new-configurations-and-better-resolution/",
    "shortUrl": "http://landing-in.onrender.com/d27bbc8b"
}
```

---
### ### 2. Redirect a Short URL

Redirects the user to the original long URL and increments the click count.

* **Method:** `GET`
* **Endpoint:** `/:shortId`

#### #### How to Use
Simply navigate to the short URL in a web browser.

**Example:**
Visiting `http://landing-in.onrender.com/d27bbc8b` in your browser will redirect you to `https://developers.googleblog.com/en/veo-3-and-veo-3-fast-new-pricing-new-configurations-and-better-resolution/`.

---
### ### 3. Get Click Count

Retrieves the total click count for a specific short URL.

* **Method:** `GET`
* **Endpoint:** `/count/:shortId`

#### #### Request Examples

**cURL:**
```bash
curl http://landing-in.onrender.com/count/d27bbc8b
```

**Browser:**
Visit `http://landing-in.onrender.com/count/d27bbc8b` in your browser.

#### #### Success Response (`200 OK`)
```json
{
    "shortId": "1a2b3c4d",
    "clicks": 15
}
```
---
## ## Local Development Setup

Follow these steps to run the project on your own machine.

#### #### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Turso CLI](https://docs.turso.tech/reference/turso-cli#installation)

#### #### 1. Clone & Install
Clone the repository and install the necessary npm packages.
```bash
git clone https://github.com/elvishpatel/landing-api.git
cd landing-api
npm install
```

#### #### 2. Configure Turso Database
Create a free database on Turso and get your credentials.
```bash
# Log in to Turso
turso auth login

# Create a new database
turso db create your-database-name

# Get the URL
turso db show your-database-name --url

# Get an auth token
turso db tokens create your-database-name
```

#### #### 3. Set Up Environment Variables
Create a file named `.env` in the root of your project. Copy the contents of `.env.example` (if present) or add your Turso credentials to it.

**.env file:**
```
TURSO_DATABASE_URL="libsql://your-db-name-username.turso.io"
TURSO_AUTH_TOKEN="your-long-auth-token"
```

#### #### 4. Create the Database Table
Run the setup script once to create the `urls` table in your Turso database.
```bash
node setup-db.js
```

#### #### 5. Run the Server
Start the local development server.
```bash
node index.js
```
The API will now be running at `http://localhost:3000`.

---
## ## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---
Developed with ❤ by Elvish Patel
