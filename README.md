# Caesar Cipher & Encryption Tool

An interactive, educational cryptography suite featuring classical and modern ciphers, visual transformation analysis, frequency calculations, a password security center, and an encrypted real-time security logs dashboard.

## Key Features

- **Classical Cipher Laboratory**: Fully interactive Caesar and Vigenère cipher engines. Real-time step-by-step visual character-shift maps.
- **Modern Symmetric & Asymmetric Encryption**: Real-time simulation of AES, DES, and RSA workflows, mapping key derivation, block padding, and mathematical modulus relations.
- **Visual Transformation Analysis**: Live character frequency histograms comparing plaintext against ciphertext to visually demonstrate diffusion and confusion.
- **Interactive Cryptanalysis Exercises**: Solve cryptography challenges to test your decryption skills.
- **Password Security Hub**: Advanced entropy calculator checking complexity, length, dictionary-strength analysis, and estimating brute-force cracking resistance.
- **Live Security Logs Dashboard**: High-fidelity logs reflecting simulated system breaches, failed handshakes, block cipher audits, and threat containment events.

## Tech Stack

- **Frontend**: React with TypeScript, Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Iconography**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the browser and navigate to `http://localhost:3000` to interact with the suite.

### Build and Deployment

To compile the application for production, run:
```bash
npm run build
```

The production assets will be generated in the `dist` directory. To start the production server:
```bash
npm run start
```

## License

This project is licensed under the MIT License.
