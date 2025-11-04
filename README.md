# ClarityCall

A minimalist, visually stunning, and high-performance video call platform built on Cloudflare Workers and WebRTC for simple, secure, and instant communication.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/jingbi72/claritycall)

## About The Project

ClarityCall is a modern, minimalist, and visually stunning video conferencing platform designed for simplicity and performance. Built on Cloudflare's serverless infrastructure, it leverages WebRTC for secure, peer-to-peer communication, ensuring low latency and privacy. The application features a clean, intuitive interface that allows users to instantly create or join meeting rooms without requiring any sign-ups. The core experience is centered around a beautifully designed meeting room with high-quality video and audio, a non-intrusive control bar for managing media devices, and a focus on a seamless user journey from landing page to live conversation. The design philosophy is 'less is more', providing essential features in a highly polished and delightful package.

### Key Features

*   **Instant Meetings:** Create or join video calls in seconds.
*   **No Sign-Up Required:** Jump straight into a conversation without creating an account.
*   **Secure & Private:** End-to-end encrypted, peer-to-peer connections powered by WebRTC.
*   **Minimalist UI:** A clean, intuitive, and beautiful interface that's a joy to use.
*   **High-Performance:** Built on Cloudflare's global network for low-latency signaling.
*   **Serverless Architecture:** Scalable and efficient backend using Cloudflare Workers and Durable Objects.

## Technology Stack

*   **Frontend:**
    *   [React](https://react.dev/)
    *   [Vite](https://vitejs.dev/)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [shadcn/ui](https://ui.shadcn.com/)
    *   [Zustand](https://zustand-demo.pmnd.rs/) for state management
    *   [Framer Motion](https://www.framer.com/motion/) for animations
*   **Backend:**
    *   [Cloudflare Workers](https://workers.cloudflare.com/)
    *   [Hono](https://hono.dev/)
    *   [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/) for stateful coordination
*   **Real-time Communication:**
    *   [WebRTC](https://webrtc.org/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [Bun](https://bun.sh/) package manager
*   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) - Cloudflare's command-line tool for Workers.

```bash
bun install -g wrangler
```

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/clarity_call.git
    cd clarity_call
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

### Running Locally

To start the development server, which runs both the Vite frontend and the Wrangler backend concurrently, use the following command:

```bash
bun dev
```

*   The React application will be available at `http://localhost:3000` (or the next available port).
*   The Cloudflare Worker backend will run locally, and API requests from the frontend will be automatically proxied.

## Project Structure

*   `src/`: Contains the frontend React application, including pages, components, hooks, and styles.
*   `worker/`: Contains the backend Cloudflare Worker code, built with Hono. This includes the Durable Object implementation for signaling.
*   `shared/`: TypeScript types and interfaces shared between the frontend and backend to ensure type safety.
*   `wrangler.jsonc`: Configuration file for the Cloudflare Worker.

## Deployment

This project is designed for easy deployment to the Cloudflare network.

1.  **Login to Wrangler:**
    Authenticate the Wrangler CLI with your Cloudflare account.
    ```bash
    wrangler login
    ```

2.  **Deploy the application:**
    Run the deploy script, which will build the frontend and deploy both the static assets and the Worker to Cloudflare.
    ```bash
    bun deploy
    ```

    Wrangler will output the URL of your deployed application.

Alternatively, you can deploy your own version of this project with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/jingbi72/claritycall)

## Architecture Overview

ClarityCall uses a hybrid architecture for real-time communication:

*   **Signaling:** A client-server model is used for signaling. The React frontend communicates with a Hono backend running on a Cloudflare Worker. A single global Durable Object is used as a central coordinator to manage room state and relay signaling messages (offers, answers, ICE candidates) between clients in the same room.
*   **Media:** A peer-to-peer (P2P) model is used for audio and video streams. Once the signaling process is complete, clients establish direct WebRTC connections with each other. Media data flows directly between participants, ensuring low latency and privacy, without passing through the server.

## License

Distributed under the MIT License. See `LICENSE` for more information.