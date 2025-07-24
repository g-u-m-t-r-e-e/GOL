# 🎮 Conway's Game of Life - Interactive Web Application

A modern, interactive implementation of Conway's Game of Life featuring a polished web interface built with Flask and the Seagull library. Experience the fascinating world of cellular automata with an intuitive, professional-grade interface.

![Conway's Game of Life](https://img.shields.io/badge/Conway's-Game%20of%20Life-blue)
![Python](https://img.shields.io/badge/Python-3.7+-green)
![Flask](https://img.shields.io/badge/Flask-Web%20Framework-red)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🎯 **Interactive Game Board**
- **Dynamic Canvas Rendering**: HTML5 Canvas with smooth animations
- **Adjustable Board Size**: From 20x20 to 200x200 cells
- **Responsive Design**: Automatically scales to fit your screen
- **Smart Cell Sizing**: Optimal visibility across all board sizes

### 🧬 **Rich Lifeform Library**
- **Gliders**: Moving patterns that travel across the board
- **Oscillators**: Blinker, Toad, Pulsar, Beacon, Pentadecathlon, Figure-8
- **Static Patterns**: Box, Seed, Moon, Kite formations
- **Spaceships**: Lightweight and Middleweight Spaceships  
- **Famous Patterns**: Gosper Glider Gun (infinite pattern generator)
- **Interactive Preview**: Visual preview of each lifeform before placement

### 🎮 **Advanced Simulation Controls**
- **Play/Pause/Stop**: Full simulation control
- **Step Navigation**: Move forward and backward through simulation history
- **Variable Speed**: Adjustable animation speed (1x to 10x)
- **History Slider**: Jump to any point in the simulation timeline
- **Configurable Iterations**: Set maximum simulation steps (10-1000)

### 🎨 **Modern Interface Design**
- **Glass-morphism Effects**: Modern blur and transparency effects
- **Gradient Styling**: Professional button and component design
- **Smooth Animations**: Polished transitions and hover effects
- **Dark Theme**: Easy on the eyes with professional color scheme
- **Responsive Layout**: Works perfectly on desktop and mobile

### 📊 **Statistical Analysis**
- **Real-time Statistics**: Cell coverage and entropy metrics
- **Peak Values**: Track maximum cell coverage and entropy
- **Average Calculations**: Monitor simulation trends over time
- **Visual Feedback**: Color-coded statistics display

### 🛠️ **User Interaction Modes**
- **Draw Mode**: Click to toggle individual cells
- **Place Mode**: Position pre-made lifeforms with precision
- **Interactive Placement**: Visual feedback during lifeform positioning

## 🚀 Quick Start

### Prerequisites
- Python 3.7 or higher
- pip package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/g-u-m-t-r-e-e/GOL.git
   cd GOL
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install the Seagull library**
   ```bash
   pip install -e .
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## 🎯 How to Use

### Getting Started
1. **Select a Lifeform**: Choose from the dropdown menu in the control panel
2. **Set Board Size**: Adjust the slider to your preferred dimensions
3. **Place Patterns**: Click on the board to place your selected lifeform
4. **Configure Simulation**: Set iterations and animation speed
5. **Run Simulation**: Click "Run Simulation" to watch the magic happen!

### Advanced Features
- **Step Through Time**: Use the step controls to move forward/backward
- **Jump to Any Point**: Drag the timeline slider to any simulation step
- **Analyze Statistics**: Monitor cell coverage and entropy in real-time
- **Clear and Restart**: Use "Clear Board" to start fresh anytime

## 🏗️ Project Structure

```
GOL/
├── app.py                  # Main Flask application
├── seagull/               # Core game engine
│   ├── __init__.py
│   ├── board.py           # Game board logic
│   ├── simulator.py       # Simulation engine
│   ├── rules.py           # Conway's rules implementation
│   ├── lifeforms/         # Pattern definitions
│   └── utils/             # Statistics and utilities
├── templates/
│   └── index.html         # Main web interface
├── static/
│   ├── style.css          # Modern UI styling
│   └── script.js          # Interactive functionality
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## 🔧 Technical Details

### Backend Architecture
- **Flask Framework**: Lightweight web server
- **Seagull Library**: Cellular automata simulation engine
- **RESTful API**: Clean separation between frontend and backend
- **NumPy Integration**: Efficient matrix operations

### Frontend Features
- **HTML5 Canvas**: High-performance rendering
- **Modern JavaScript**: ES6+ features with async/await
- **CSS Grid/Flexbox**: Responsive layout system
- **Custom Animations**: Smooth transitions and effects

### Performance Optimizations
- **Request Throttling**: Prevents API spam during interactions
- **Render Optimization**: Only redraws when necessary
- **Memory Efficient**: Smart history management
- **Responsive Design**: Adapts to any screen size

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Setup
```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run tests
python -m pytest tests/

# Start development server
python app.py
```

## 📸 Screenshots

*Add your screenshots here to showcase the beautiful interface*

## 🐛 Known Issues

- Some browser compatibility issues with older versions
- Performance may vary on very large boards (>150x150)

## 🔮 Future Enhancements

- [ ] Additional cellular automata rules
- [ ] Pattern import/export functionality  
- [ ] Multi-color cell states
- [ ] 3D visualization mode
- [ ] Pattern sharing community

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Conway's Game of Life**: Created by mathematician John Horton Conway
- **Seagull Library**: Python framework for cellular automata
- **Flask Community**: Web framework and ecosystem
- **Contributors**: Everyone who helped make this project better

## 📬 Contact

- **Issues**: [GitHub Issues](https://github.com/g-u-m-t-r-e-e/GOL/issues)
- **Discussions**: [GitHub Discussions](https://github.com/g-u-m-t-r-e-e/GOL/discussions)

---

**Enjoy exploring the fascinating patterns of Conway's Game of Life! 🎮✨**
