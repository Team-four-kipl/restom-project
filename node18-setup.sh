#!/bin/bash
set -e

echo "🚀 Setting up Node.js 18 on Ubuntu 18.04..."

# Step 1: Remove any existing Node.js and npm
echo "🔹 Removing old Node.js and npm..."
sudo apt remove -y nodejs npm || true

# Step 2: Install curl if missing
echo "🔹 Ensuring curl is installed..."
sudo apt update -y
sudo apt install -y curl build-essential -y

# Step 3: Install NVM (Node Version Manager)
echo "🔹 Installing NVM..."
export NVM_DIR="$HOME/.nvm"
if [ ! -d "$NVM_DIR" ]; then
	  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
  fi

  # Step 4: Load NVM for this session
  echo "🔹 Loading NVM..."
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

  # Step 5: Verify that NVM works
  command -v nvm >/dev/null 2>&1 || { echo "❌ NVM not found in PATH. Restart your terminal and run this script again."; exit 1; }

  # Step 6: Install Node.js v18 (LTS)
  echo "🔹 Installing Node.js v18 LTS..."
  nvm install 18.20.3
  nvm alias default 18.20.3
  nvm use 18.20.3

  # Step 7: Verify installation
  echo "✅ Node.js and npm versions:"
  node -v
  npm -v

  echo "🎉 Node.js 18 setup complete!"
 
