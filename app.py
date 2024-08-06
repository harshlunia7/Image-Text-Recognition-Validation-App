from flask import Flask, jsonify, request, render_template
import os
import json

app = Flask(__name__)

DATA_DIR = './data'
JSON_FILE = os.path.join(DATA_DIR, 'responses.json')
BACKUP_JSON_FILE = os.path.join(DATA_DIR, 'backup_response.json')
backup_after_records = 10
backup_response = {}

def initialize_backup():
    global backup_response
    if os.path.exists(BACKUP_JSON_FILE):
        with open(BACKUP_JSON_FILE, 'r') as file:
            backup_response = json.load(file)
    else:
        backup_response = {}

def modifiy_indices_of_data(start_index, data):
    updated_dict = {str(start_index + idx): data[key] for idx, key in enumerate(data.keys())}
    return updated_dict

def check_and_backup(responses):
    global backup_response
    global backup_after_records
    if len(responses) - len(backup_response) > backup_after_records:
        with open(BACKUP_JSON_FILE, 'w') as file:
            json.dump(responses, file)
        backup_response = responses

# Load image pairs
def load_image_pairs():
    initialize_backup()
    image_pairs = []
    if os.path.exists(JSON_FILE):
        with open(JSON_FILE, 'r') as file:
            responses = json.load(file)
            responded_indices = set(responses.keys())
    with open(os.path.join(DATA_DIR, 'image_labels.txt'), 'r') as file:
        for index, line in enumerate(file):
            if 'responded_indices' in locals(): 
              if str(index) not in responded_indices:
                image_path, label = line.strip().split('\t')
                image_pairs.append({'index': index, 'image': image_path, 'label': label})
            else:
                image_path, label = line.strip().split('\t')
                image_pairs.append({'index': index, 'image': image_path, 'label': label})
    
    return image_pairs

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_image_pairs', methods=['GET'])
def get_image_pairs():
    image_pairs = load_image_pairs()
    return jsonify({'image_pairs': image_pairs})

@app.route('/save_response', methods=['POST'])
def save_response():
    data = request.get_json()

    # Load existing responses
    if os.path.exists(JSON_FILE):
        with open(JSON_FILE, 'r') as file:
            responses = json.load(file)
    else:
        responses = {}

    # Update response
    responses = {
        **responses,
        **modifiy_indices_of_data(len(responses), data)
    }

    # Save responses
    with open(JSON_FILE, 'w') as file:
        json.dump(responses, file)

    check_and_backup(responses)

    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
