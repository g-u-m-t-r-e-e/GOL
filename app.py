#!/usr/bin/env python3
"""
Interactive Conway's Game of Life Web App using the Seagull library
"""

from flask import Flask, render_template, request, jsonify
import numpy as np
import json
import seagull as sg
from seagull import lifeforms as lf
from seagull.lifeforms import Custom

app = Flask(__name__)

# Global variables to store game state
current_board = None
current_simulator = None
simulation_history = []
current_step = 0
is_running = False

# Available lifeforms
LIFEFORMS = {
    'glider': lf.Glider(),
    'blinker': lf.Blinker(length=3),
    'toad': lf.Toad(),
    'pulsar': lf.Pulsar(),
    'beacon': lf.Beacon(),
    'pentadecathlon': lf.Pentadecathlon(),
    'figure_eight': lf.FigureEight(),
    'box': lf.Box(),
    'seed': lf.Seed(),
    'moon': lf.Moon(),
    'lightweight_spaceship': lf.LightweightSpaceship(),
    'middleweight_spaceship': lf.MiddleweightSpaceship(),
    'glider_gun': Custom([
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ])
}

def initialize_board(size=50):
    """Initialize a new board"""
    global current_board, current_simulator, simulation_history, current_step
    current_board = sg.Board(size=(size, size))
    current_simulator = None
    simulation_history = []
    current_step = 0

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/api/board/new', methods=['POST'])
def new_board():
    """Create a new board"""
    data = request.get_json()
    size = data.get('size', 50)
    initialize_board(size)
    return jsonify({
        'status': 'success',
        'board': current_board.state.astype(int).tolist(),
        'size': size
    })

@app.route('/api/board/clear', methods=['POST'])
def clear_board():
    """Clear the current board"""
    global simulation_history, current_step, current_simulator
    if current_board:
        current_board.clear()
        simulation_history = []
        current_step = 0
        current_simulator = None
        return jsonify({
            'status': 'success',
            'board': current_board.state.astype(int).tolist()
        })
    return jsonify({'status': 'error', 'message': 'No board initialized'})

@app.route('/api/board/state')
def get_board_state():
    """Get current board state"""
    if current_board:
        return jsonify({
            'board': current_board.state.astype(int).tolist(),
            'step': current_step,
            'total_steps': len(simulation_history),
            'size': current_board.size
        })
    return jsonify({'status': 'error', 'message': 'No board initialized'})

@app.route('/api/lifeforms')
def get_lifeforms():
    """Get available lifeforms"""
    lifeform_data = {}
    for name, lifeform in LIFEFORMS.items():
        lifeform_data[name] = {
            'name': name.replace('_', ' ').title(),
            'layout': lifeform.layout.astype(int).tolist(),
            'size': lifeform.size
        }
    return jsonify(lifeform_data)

@app.route('/api/board/add_lifeform', methods=['POST'])
def add_lifeform():
    """Add a lifeform to the board"""
    if not current_board:
        return jsonify({'status': 'error', 'message': 'No board initialized'})
    
    data = request.get_json()
    lifeform_name = data.get('lifeform')
    location = data.get('location', [0, 0])
    
    if lifeform_name not in LIFEFORMS:
        return jsonify({'status': 'error', 'message': 'Invalid lifeform'})
    
    try:
        lifeform = LIFEFORMS[lifeform_name]
        current_board.add(lifeform, loc=tuple(location))
        return jsonify({
            'status': 'success',
            'board': current_board.state.astype(int).tolist()
        })
    except ValueError as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/board/toggle_cell', methods=['POST'])
def toggle_cell():
    """Toggle a single cell on the board"""
    if not current_board:
        return jsonify({'status': 'error', 'message': 'No board initialized'})
    
    data = request.get_json()
    row = data.get('row')
    col = data.get('col')
    
    if 0 <= row < current_board.size[0] and 0 <= col < current_board.size[1]:
        current_board.state[row, col] = not current_board.state[row, col]
        return jsonify({
            'status': 'success',
            'board': current_board.state.astype(int).tolist()
        })
    
    return jsonify({'status': 'error', 'message': 'Invalid cell coordinates'})

@app.route('/api/simulation/start', methods=['POST'])
def start_simulation():
    """Start simulation and generate history"""
    global current_simulator, simulation_history, current_step
    
    if not current_board:
        return jsonify({'status': 'error', 'message': 'No board initialized'})
    
    data = request.get_json()
    iterations = data.get('iterations', 100)
    rule = data.get('rule', 'conway_classic')
    
    try:
        current_simulator = sg.Simulator(current_board)
        
        # Run simulation to generate history
        if rule == 'conway_classic':
            current_simulator.run(sg.rules.conway_classic, iters=iterations)
        else:
            # For custom rules, use life_rule with rulestring
            current_simulator.run(
                lambda x: sg.rules.life_rule(x, rulestring=rule), 
                iters=iterations
            )
        
        simulation_history = [state.astype(int).tolist() for state in current_simulator.history]
        current_step = 0
        
        return jsonify({
            'status': 'success',
            'total_steps': len(simulation_history),
            'stats': current_simulator.stats
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/simulation/step', methods=['POST'])
def step_simulation():
    """Step forward or backward in simulation"""
    global current_step
    
    if not simulation_history:
        return jsonify({'status': 'error', 'message': 'No simulation history'})
    
    data = request.get_json()
    direction = data.get('direction', 'forward')
    
    if direction == 'forward' and current_step < len(simulation_history) - 1:
        current_step += 1
    elif direction == 'backward' and current_step > 0:
        current_step -= 1
    
    return jsonify({
        'status': 'success',
        'board': simulation_history[current_step],
        'step': current_step,
        'total_steps': len(simulation_history)
    })

@app.route('/api/simulation/goto', methods=['POST'])
def goto_step():
    """Go to specific step in simulation"""
    global current_step
    
    if not simulation_history:
        return jsonify({'status': 'error', 'message': 'No simulation history'})
    
    data = request.get_json()
    step = data.get('step', 0)
    
    if 0 <= step < len(simulation_history):
        current_step = step
        return jsonify({
            'status': 'success',
            'board': simulation_history[current_step],
            'step': current_step,
            'total_steps': len(simulation_history)
        })
    
    return jsonify({'status': 'error', 'message': 'Invalid step'})

@app.route('/api/simulation/stop', methods=['POST'])
def stop_simulation():
    """Stop simulation"""
    global simulation_history, current_step, current_simulator
    simulation_history = []
    current_step = 0
    current_simulator = None
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    initialize_board()
    app.run(debug=True, host='0.0.0.0', port=5000) 