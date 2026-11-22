\# Outreach AI – AI Cold Email Generator



Outreach AI is an AI-powered web application that helps users generate personalized professional outreach content. It uses the Groq API to generate email content and other outreach messages based on user input.



\## Features



\- User registration and login

\- Email OTP verification

\- Secure password hashing

\- JWT-based authentication

\- AI-generated cold email subject lines and email bodies

\- LinkedIn message generation

\- Follow-up email generation

\- Email history management



\## Tech Stack



\*\*Frontend\*\*

\- React.js

\- Vite

\- Tailwind CSS

\- Axios

\- React Context API



\*\*Backend\*\*

\- Node.js

\- Express.js

\- MongoDB

\- Mongoose

\- JSON Web Token (JWT)

\- bcrypt

\- Nodemailer

\- Groq API



\## Project Structure



```text

Outreach AI/

├── client/

│   ├── src/

│   │   ├── components/

│   │   ├── context/

│   │   ├── pages/

│   │   └── utils/

│   └── package.json

│

├── server/

│   ├── config/

│   ├── controllers/

│   ├── middleware/

│   ├── models/

│   ├── routes/

│   ├── utils/

│   └── package.json

│

├── .gitignore

├── package.json

└── README.md

```



\## Environment Configuration



Create a `.env` file inside the `server` directory and configure the required environment variables:



```env

EMAIL\_USER=

EMAIL\_PASS=

MONGO\_URI=

JWT\_SECRET=

GROQ\_API\_KEY=

```



Use your own credentials and API keys. Never upload your actual `.env` file to GitHub.



\## Installation



Clone the repository:



```bash

git clone YOUR\_GITHUB\_REPOSITORY\_URL

```



Install the frontend and backend dependencies using their respective package files.



```bash

cd server

npm install

```



```bash

cd ../client

npm install

```



Configure the required environment variables before running the application.



\## Project Status



Currently under development.

