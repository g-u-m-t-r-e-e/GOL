#!/bin/bash

# Conway's Game of Life - Git Setup Script
# This script helps prepare your project for contributing to the GOL repository

echo "🎮 Conway's Game of Life - Git Setup"
echo "=================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
else
    echo "✅ Git repository already initialized"
fi

# Add the original repository as upstream
echo "🔗 Setting up remote repositories..."
git remote add origin https://github.com/g-u-m-t-r-e-e/GOL.git
git remote -v

# Stage all files
echo "📋 Staging files for commit..."
git add .

# Show status
echo "📊 Repository status:"
git status

echo ""
echo "🚀 Next steps:"
echo "1. Review the staged files above"
echo "2. Create your first commit:"
echo "   git commit -m \"feat: Add interactive Conway's Game of Life web application\""
echo ""
echo "3. Push to your fork:"
echo "   git push -u origin main"
echo ""
echo "4. Create a Pull Request on GitHub using the template in PULL_REQUEST_TEMPLATE.md"
echo ""
echo "✨ Your professional Conway's Game of Life web app is ready for contribution!" 