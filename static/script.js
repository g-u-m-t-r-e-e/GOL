// Conway's Game of Life Interactive Web App
class GameOfLife {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.boardSize = 50;
        this.cellSize = 12;
        this.board = [];
        this.selectedLifeform = null;
        this.lifeforms = {};
        this.isDrawMode = false;
        this.isPlaceMode = true;
        this.animationId = null;
        this.animationSpeed = 500;
        this.currentStep = 0;
        this.totalSteps = 0;
        this.simulationHistory = [];
        this.isPlaying = false;
        this.isRequestInProgress = false;
        this.pendingAnimationFrame = null;
        this.needsRedraw = true;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.loadLifeforms();
        this.initializeBoard();
    }

    setupCanvas() {
        this.updateCanvasSize();
    }

    updateCanvasSize() {
        // Calculate optimal cell size (between 4 and 12 pixels)
        const maxCanvasSize = 800;
        const minCellSize = 4;
        const maxCellSize = 12;
        
        let cellSize = Math.min(maxCellSize, Math.max(minCellSize, maxCanvasSize / this.boardSize));
        this.cellSize = cellSize;
        
        // Set canvas size based on board size and cell size
        this.canvas.width = this.boardSize * this.cellSize;
        this.canvas.height = this.boardSize * this.cellSize;
        
        // Ensure canvas doesn't exceed container
        const maxSize = Math.min(maxCanvasSize, window.innerWidth - 400);
        if (this.canvas.width > maxSize) {
            const scale = maxSize / this.canvas.width;
            this.canvas.width = maxSize;
            this.canvas.height = maxSize;
            this.cellSize = this.cellSize * scale;
        }
    }

    setupEventListeners() {
        // Board controls
        document.getElementById('board-size').addEventListener('input', (e) => {
            this.boardSize = parseInt(e.target.value);
            document.getElementById('board-size-value').textContent = `${this.boardSize}x${this.boardSize}`;
            this.updateCanvasSize();
            this.needsRedraw = true;
            this.renderBoard();
            // Create new board with the updated size
            this.createNewBoard();
        });

        document.getElementById('new-board').addEventListener('click', () => this.createNewBoard());
        document.getElementById('clear-board').addEventListener('click', () => this.clearBoard());

        // Simulation controls
        document.getElementById('run-simulation').addEventListener('click', () => this.toggleSimulation());
        document.getElementById('pause-simulation').addEventListener('click', () => this.pauseSimulation());
        document.getElementById('stop-simulation').addEventListener('click', () => this.stopSimulation());

        // Step controls
        document.getElementById('step-forward').addEventListener('click', () => this.stepSimulation('forward'));
        document.getElementById('step-backward').addEventListener('click', () => this.stepSimulation('backward'));
        
        // Improved slider handling with proper debouncing and state management
        let sliderTimeout = null;
        let isSliderDragging = false;
        const stepSlider = document.getElementById('step-slider');
        
        // Track when user starts dragging
        stepSlider.addEventListener('mousedown', () => {
            isSliderDragging = true;
        });
        
        // Track when user stops dragging
        document.addEventListener('mouseup', () => {
            if (isSliderDragging) {
                isSliderDragging = false;
                // Only make API call when user finishes dragging
                if (sliderTimeout) clearTimeout(sliderTimeout);
                const targetStep = parseInt(stepSlider.value);
                if (targetStep !== this.currentStep) {
                    this.gotoStep(targetStep);
                }
            }
        });
        
        // Handle keyboard input and smaller adjustments
        stepSlider.addEventListener('input', (e) => {
            if (isSliderDragging) return; // Don't process during drag
            
            if (sliderTimeout) clearTimeout(sliderTimeout);
            sliderTimeout = setTimeout(() => {
                const targetStep = parseInt(e.target.value);
                if (targetStep !== this.currentStep) {
                    this.gotoStep(targetStep);
                }
            }, 300); // Increased debounce time
        });

        // Animation speed
        document.getElementById('animation-speed').addEventListener('input', (e) => {
            this.animationSpeed = 1100 - (parseInt(e.target.value) * 100);
            document.getElementById('speed-value').textContent = e.target.value;
        });

        // Mode controls
        document.getElementById('draw-mode').addEventListener('click', () => this.setDrawMode());
        document.getElementById('place-mode').addEventListener('click', () => this.setPlaceMode());

        // Lifeform selection
        document.getElementById('lifeform-select').addEventListener('change', (e) => {
            this.selectedLifeform = e.target.value;
            this.updateLifeformPreview();
            this.updateUI();
        });

        // Canvas interactions
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasHover(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    async loadLifeforms() {
        try {
            const response = await fetch('/api/lifeforms');
            this.lifeforms = await response.json();
            this.populateLifeformSelect();
        } catch (error) {
            this.showToast('Error loading lifeforms', 'error');
        }
    }

    populateLifeformSelect() {
        const select = document.getElementById('lifeform-select');
        select.innerHTML = '<option value="">Choose a lifeform...</option>';
        
        Object.keys(this.lifeforms).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = this.lifeforms[key].name;
            select.appendChild(option);
        });
    }

    updateLifeformPreview() {
        const previewGrid = document.getElementById('lifeform-preview-grid');
        
        if (!this.selectedLifeform || !this.lifeforms[this.selectedLifeform]) {
            previewGrid.innerHTML = '<div style="color: var(--text-secondary); text-align: center;">Select a lifeform to preview</div>';
            return;
        }

        const lifeform = this.lifeforms[this.selectedLifeform];
        const layout = lifeform.layout;
        
        // Calculate optimal cell size for preview based on lifeform dimensions
        const maxPreviewSize = 120; // Maximum preview box size in pixels
        const maxDimension = Math.max(layout.length, layout[0].length);
        const cellSize = Math.max(3, Math.min(8, Math.floor(maxPreviewSize / maxDimension)));
        
        previewGrid.style.gridTemplateColumns = `repeat(${layout[0].length}, ${cellSize}px)`;
        previewGrid.innerHTML = '';

        layout.forEach(row => {
            row.forEach(cell => {
                const cellDiv = document.createElement('div');
                cellDiv.className = `preview-cell ${cell ? 'alive' : ''}`;
                cellDiv.style.width = `${cellSize}px`;
                cellDiv.style.height = `${cellSize}px`;
                previewGrid.appendChild(cellDiv);
            });
        });
    }

    async initializeBoard() {
        try {
            const response = await fetch('/api/board/state');
            const data = await response.json();
            
                         if (data.board) {
                 this.board = data.board;
                 this.boardSize = data.size[0];
                 document.getElementById('board-size-value').textContent = `${this.boardSize}x${this.boardSize}`;
                 document.getElementById('board-size').value = this.boardSize;
                 this.updateCanvasSize();
                 this.needsRedraw = true;
                 this.renderBoard();
                 this.updateUI();
             }
        } catch (error) {
            this.createNewBoard();
        }
    }

    async createNewBoard() {
        try {
            const response = await fetch('/api/board/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ size: this.boardSize })
            });
            
            const data = await response.json();
            if (data.status === 'success') {
                this.board = data.board;
                this.simulationHistory = [];
                this.currentStep = 0;
                this.totalSteps = 0;
                this.updateCanvasSize();
                this.needsRedraw = true;
                this.renderBoard();
                this.updateUI();
                this.showToast('New board created', 'success');
            }
        } catch (error) {
            this.showToast('Error creating board', 'error');
        }
    }

    async clearBoard() {
        try {
            const response = await fetch('/api/board/clear', { method: 'POST' });
            const data = await response.json();
            
            if (data.status === 'success') {
                this.board = data.board;
                this.simulationHistory = [];
                this.currentStep = 0;
                this.totalSteps = 0;
                this.needsRedraw = true;
                this.renderBoard();
                this.updateUI();
                this.showToast('Board cleared', 'success');
            }
        } catch (error) {
            this.showToast('Error clearing board', 'error');
        }
    }

         updateCellSize() {
         this.updateCanvasSize();
         this.needsRedraw = true;
         this.renderBoard();
     }

    renderBoard() {
        if (!this.needsRedraw) return;
        
        // Use a single begin/end path for better performance
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid more efficiently
        this.ctx.strokeStyle = '#374151';
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        
        for (let i = 0; i <= this.boardSize; i++) {
            const pos = i * this.cellSize;
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvas.height);
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvas.width, pos);
        }
        this.ctx.stroke();

        // Draw cells more efficiently - batch alive cells
        this.ctx.fillStyle = '#10b981';
        this.ctx.beginPath();
        
        this.board.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell) {
                    const x = j * this.cellSize;
                    const y = i * this.cellSize;
                    this.ctx.rect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
                }
            });
        });
        
        this.ctx.fill();
        this.needsRedraw = false;
    }

    drawCell(row, col, alive) {
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        
        this.ctx.fillStyle = alive ? '#10b981' : '#1e293b';
        this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
    }

    getCellFromCoordinates(x, y) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = x - rect.left;
        const canvasY = y - rect.top;
        
        const col = Math.floor(canvasX / this.cellSize);
        const row = Math.floor(canvasY / this.cellSize);
        
        return { row, col };
    }

    async handleCanvasClick(e) {
        const { row, col } = this.getCellFromCoordinates(e.clientX, e.clientY);
        
        if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) return;

        if (this.isDrawMode) {
            await this.toggleCell(row, col);
        } else if (this.isPlaceMode && this.selectedLifeform) {
            await this.placeLifeform(row, col);
        }
    }

    handleCanvasHover(e) {
        // Could add hover effects here
    }

    handleMouseDown(e) {
        if (this.isDrawMode) {
            this.isDrawing = true;
        }
    }

    handleMouseUp(e) {
        this.isDrawing = false;
    }

    async toggleCell(row, col) {
        try {
            const response = await fetch('/api/board/toggle_cell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ row, col })
            });
            
            const data = await response.json();
            if (data.status === 'success') {
                this.board = data.board;
                this.needsRedraw = true;
                this.renderBoard();
            }
        } catch (error) {
            this.showToast('Error toggling cell', 'error');
        }
    }

    async placeLifeform(row, col) {
        if (!this.selectedLifeform) return;

        // Get the lifeform data to check its size
        const lifeform = this.lifeforms[this.selectedLifeform];
        if (!lifeform || !lifeform.layout) return;

        // Check if the lifeform fits within the board boundaries
        const lifeformHeight = lifeform.layout.length;
        const lifeformWidth = lifeform.layout[0].length;
        
        // Ensure the lifeform doesn't go out of bounds
        if (row + lifeformHeight > this.boardSize || col + lifeformWidth > this.boardSize) {
            this.showToast(`Not enough space! ${lifeform.name} needs ${lifeformWidth}x${lifeformHeight} cells.`, 'warning');
            return;
        }

        try {
            const response = await fetch('/api/board/add_lifeform', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lifeform: this.selectedLifeform,
                    location: [row, col]
                })
            });
            
            const data = await response.json();
            if (data.status === 'success') {
                this.board = data.board;
                this.needsRedraw = true;
                this.renderBoard();
                this.showToast(`${this.lifeforms[this.selectedLifeform].name} placed`, 'success');
            } else {
                this.showToast(data.message, 'error');
            }
        } catch (error) {
            this.showToast('Error placing lifeform', 'error');
        }
    }

    async toggleSimulation() {
        // If we have simulation history and we're not at the end, resume
        if (this.totalSteps > 0 && this.currentStep < this.totalSteps - 1 && !this.isPlaying) {
            this.playAnimation();
            this.showToast('Simulation resumed', 'success');
        } else {
            // Start new simulation
            await this.startSimulation();
        }
    }

    async startSimulation() {
        const iterations = parseInt(document.getElementById('iterations').value);
        
        try {
            this.updateSimulationStatus('Generating simulation...');
            
            const response = await fetch('/api/simulation/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    iterations: iterations,
                    rule: 'conway_classic'
                })
            });
            
            const data = await response.json();
            if (data.status === 'success') {
                this.totalSteps = data.total_steps;
                this.currentStep = 0;
                this.updateStepControls();
                this.updateStats(data.stats);
                this.playAnimation();
                this.showToast('Simulation started', 'success');
            } else {
                this.showToast(data.message, 'error');
                this.updateSimulationStatus('Ready');
            }
        } catch (error) {
            this.showToast('Error starting simulation', 'error');
            this.updateSimulationStatus('Ready');
        }
    }

    playAnimation() {
        if (this.animationId) {
            clearTimeout(this.animationId);
        }
        if (this.pendingAnimationFrame) {
            cancelAnimationFrame(this.pendingAnimationFrame);
        }

        this.isPlaying = true;
        this.updateSimulationControls();
        this.updateSimulationStatus('Running');
        this.lastAnimationTime = performance.now();

        const animate = (currentTime) => {
            if (!this.isPlaying) return;

            // Check if enough time has passed based on animation speed
            if (currentTime - this.lastAnimationTime >= this.animationSpeed) {
                this.lastAnimationTime = currentTime;
                
                // Only proceed if no request is in progress
                if (!this.isRequestInProgress) {
                    this.stepSimulation('forward').then(() => {
                        if (this.currentStep >= this.totalSteps - 1 || !this.isPlaying) {
                            this.pauseSimulation();
                        }
                    });
                }
            }

            if (this.isPlaying) {
                this.pendingAnimationFrame = requestAnimationFrame(animate);
            }
        };

        this.pendingAnimationFrame = requestAnimationFrame(animate);
    }

    pauseSimulation() {
        this.isPlaying = false;
        if (this.animationId) {
            clearTimeout(this.animationId);
            this.animationId = null;
        }
        if (this.pendingAnimationFrame) {
            cancelAnimationFrame(this.pendingAnimationFrame);
            this.pendingAnimationFrame = null;
        }
        this.updateSimulationControls();
        this.updateSimulationStatus('Paused');
    }

    async stopSimulation() {
        this.isPlaying = false;
        if (this.animationId) {
            clearTimeout(this.animationId);
            this.animationId = null;
        }
        if (this.pendingAnimationFrame) {
            cancelAnimationFrame(this.pendingAnimationFrame);
            this.pendingAnimationFrame = null;
        }

        try {
            await fetch('/api/simulation/stop', { method: 'POST' });
            this.currentStep = 0;
            this.totalSteps = 0;
            this.updateStepControls();
            this.updateSimulationControls();
            this.updateSimulationStatus('Stopped');
            this.showToast('Simulation stopped', 'success');
        } catch (error) {
            this.showToast('Error stopping simulation', 'error');
        }
    }

    async stepSimulation(direction) {
        if (this.isRequestInProgress) return;
        
        try {
            this.isRequestInProgress = true;
            const response = await fetch('/api/simulation/step', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ direction })
            });
            
            const data = await response.json();
            if (data.status === 'success') {
                this.board = data.board;
                this.currentStep = data.step;
                this.totalSteps = data.total_steps;
                this.needsRedraw = true;
                this.renderBoard();
                this.updateStepControls();
            }
        } catch (error) {
            this.showToast('Error stepping simulation', 'error');
        } finally {
            this.isRequestInProgress = false;
        }
    }

    async gotoStep(step) {
        if (this.isRequestInProgress) return;
        
        // Prevent going to invalid steps
        if (step < 0 || step >= this.totalSteps || step === this.currentStep) {
            return;
        }
        
        try {
            this.isRequestInProgress = true;
            this.updateSimulationControls(); // Disable controls during request
            
            const response = await fetch('/api/simulation/goto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ step })
            });
            
            const data = await response.json();
            if (data.status === 'success') {
                this.board = data.board;
                this.currentStep = data.step;
                this.totalSteps = data.total_steps;
                this.needsRedraw = true;
                this.renderBoard();
                this.updateStepControls();
            } else {
                // Reset slider to current position if request failed
                document.getElementById('step-slider').value = this.currentStep;
                this.showToast('Error going to step', 'error');
            }
        } catch (error) {
            // Reset slider to current position if request failed
            document.getElementById('step-slider').value = this.currentStep;
            this.showToast('Error going to step', 'error');
        } finally {
            this.isRequestInProgress = false;
            this.updateSimulationControls(); // Re-enable controls
        }
    }

    setDrawMode() {
        this.isDrawMode = true;
        this.isPlaceMode = false;
        document.getElementById('draw-mode').classList.add('active');
        document.getElementById('place-mode').classList.remove('active');
        this.canvas.style.cursor = 'crosshair';
        this.updateUI();
    }

    setPlaceMode() {
        this.isDrawMode = false;
        this.isPlaceMode = true;
        document.getElementById('place-mode').classList.add('active');
        document.getElementById('draw-mode').classList.remove('active');
        this.canvas.style.cursor = 'pointer';
        this.updateUI();
    }

    updateStepControls() {
        const stepSlider = document.getElementById('step-slider');
        
        // Only update slider value if it's not currently being dragged by user
        const isUserInteracting = stepSlider === document.activeElement || 
                                  stepSlider.matches(':focus') ||
                                  document.querySelector(':active') === stepSlider;
        
        stepSlider.max = Math.max(0, this.totalSteps - 1);
        
        // Only update slider value if user isn't currently interacting with it
        if (!isUserInteracting) {
            stepSlider.value = this.currentStep;
        }
        
        stepSlider.disabled = this.totalSteps === 0 || this.isRequestInProgress;
        
        document.getElementById('current-step').textContent = this.currentStep;
        document.getElementById('total-steps').textContent = Math.max(0, this.totalSteps - 1);
    }

    updateSimulationControls() {
        const runBtn = document.getElementById('run-simulation');
        const pauseBtn = document.getElementById('pause-simulation');
        const stopBtn = document.getElementById('stop-simulation');
        const stepForward = document.getElementById('step-forward');
        const stepBackward = document.getElementById('step-backward');
        
        // Update run button text based on state
        const runIcon = runBtn.querySelector('i');
        
        if (this.isPlaying) {
            runBtn.disabled = true;
        } else if (this.totalSteps > 0 && this.currentStep < this.totalSteps - 1) {
            // Has history and not at end - show Resume
            runBtn.disabled = this.isRequestInProgress;
            runIcon.className = 'fas fa-play';
            runBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        } else {
            // No history or at end - show Run
            runBtn.disabled = this.isRequestInProgress;
            runIcon.className = 'fas fa-play';
            runBtn.innerHTML = '<i class="fas fa-play"></i> Run';
        }
        
        pauseBtn.disabled = !this.isPlaying;
        stopBtn.disabled = (this.totalSteps === 0 && !this.isPlaying) || this.isRequestInProgress;
        stepForward.disabled = this.currentStep >= this.totalSteps - 1 || this.totalSteps === 0 || this.isRequestInProgress;
        stepBackward.disabled = this.currentStep <= 0 || this.totalSteps === 0 || this.isRequestInProgress;
    }

    updateSimulationStatus(status) {
        document.getElementById('simulation-status').textContent = status;
    }

    updateStats(stats) {
        if (!stats) return;
        
        document.getElementById('peak-coverage').textContent = 
            (stats.peak_cell_coverage * 100).toFixed(1) + '%';
        document.getElementById('avg-coverage').textContent = 
            (stats.avg_cell_coverage * 100).toFixed(1) + '%';
        document.getElementById('peak-entropy').textContent = 
            stats.peak_shannon_entropy.toFixed(2);
        document.getElementById('avg-entropy').textContent = 
            stats.avg_shannon_entropy.toFixed(2);
    }

    updateUI() {
        const mode = this.isDrawMode ? 'Draw Mode' : 'Place Mode';
        const selected = this.selectedLifeform ? 
            this.lifeforms[this.selectedLifeform].name : 'None';
        
        document.getElementById('current-mode').textContent = mode;
        document.getElementById('selected-lifeform').textContent = selected;
        
        this.updateStepControls();
        this.updateSimulationControls();
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new GameOfLife();
}); 