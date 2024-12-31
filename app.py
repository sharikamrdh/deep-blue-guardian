from flask import Flask, jsonify, request, render_template
import requests
import random
import sqlite3

app = Flask(__name__)

# Token API Hugging Face
HUGGING_FACE_API_TOKEN = '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'  # Remplace par ton token Hugging Face
HEADERS = {
    'Authorization': 'Bearer ' + HUGGING_FACE_API_TOKEN
}

# Variable globale pour verifier si une requete a ete effectuee
request_made = False
pollution_level = 0  # Initialisation du niveau de pollution

# Route pour obtenir le niveau de pollution
@app.route('/pollution', methods=['GET'])
def get_pollution():
    return jsonify({'pollutionLevel': pollution_level})

# Route pour mettre a jour le niveau de pollution
@app.route('/update-pollution', methods=['POST'])
def update_pollution():
    global pollution_level
    change = request.json.get('change', 0)
    pollution_level += change
    return jsonify({'newPollutionLevel': pollution_level})

# Route pour obtenir la difficulte en fonction de la pollution
@app.route('/difficulty', methods=['GET'])
def get_difficulty():
    if pollution_level > 80:
        difficulty = 'Hard'
    elif pollution_level > 50:
        difficulty = 'Medium'
    else:
        difficulty = 'Easy'
    return jsonify({'difficulty': difficulty})

@app.route('/educational', methods=['GET'])
def get_educational_tip():
    global request_made
    if request_made:
        response = {'tip': 'Vous avez deja fait une requete.'}
        return jsonify(response)

    # Exemple de prompt a envoyer a Hugging Face
    prompt = "Donne-moi un conseil educatif concernant l'ecologie."

    url = "https://api-inference.huggingface.co/models/gpt-neo-2.7B" # Verifiez le modele disponible
    payload = {
        "inputs": prompt
    }

    # Faire la requete POST
    response = requests.post(url, headers=HEADERS, json=payload)

    if response.status_code == 200:
        result = response.json()
        tip = result.get('generated_text', 'Aucun conseil disponible.')
        request_made = True  # Marquer que la requete a ete effectuee
    else:
        tip = "Erreur lors de la recuperation du conseil educatif."

    return jsonify({'tip': tip})

# Route d'accueil
@app.route('/')
def hello_world():
    return render_template('index.html')

# Route pour generer un defi en fonction de la pollution
@app.route('/generate-challenge', methods=['GET'])
def generate_challenge():
    challenge = None
    if pollution_level > 80:
        challenge = "High pollution! Avoid toxic waste!"
    elif pollution_level > 50:
        challenge = "Medium pollution! Watch out for fast currents."
    else:
        challenge = "Low pollution! Collect as many items as you can!"
    
    events = ["A storm is coming!", "A new wave of trash appears!", "A dolphin needs help!"]
    event = random.choice(events)
    
    return jsonify({'challenge': challenge, 'event': event})

# Exemple d'un joueur avec un score et une vitesse de collecte
player_state = {
    'score': 0,
    'collection_speed': 1.0  # Vitesse de collecte des dechets
}

# Route pour obtenir l'etat du joueur
@app.route('/player-state', methods=['GET'])
def get_player_state():
    return jsonify(player_state)

# Route pour mettre a jour le score du joueur
@app.route('/update-score', methods=['POST'])
def update_score():
    global player_state
    score_change = request.json.get('score', 0)
    player_state['score'] += score_change
    return jsonify({'newScore': player_state['score']})

# Route pour obtenir le niveau suivant
@app.route('/next-level', methods=['GET'])
def next_level():
    if player_state['score'] > 100:
        level = 'Advanced'
    elif player_state['score'] > 50:
        level = 'Intermediate'
    else:
        level = 'Beginner'
    return jsonify({'currentLevel': level})

# Fonction pour la connexion a la base de donnees
def get_db_connection():
    conn = sqlite3.connect('game.db')
    conn.row_factory = sqlite3.Row
    return conn

# Route pour sauvegarder l'etat du joueur
@app.route('/save-state', methods=['POST'])
def save_state():
    player_data = request.json
    conn = get_db_connection()
    conn.execute('INSERT INTO player_state (score, pollution_level) VALUES (?, ?)',
                 (player_data['score'], player_data['pollution_level']))
    conn.commit()
    conn.close()
    return jsonify({"message": "Player state saved successfully!"})

# Creer la base de donnees a chaque requete (avant chaque requete)
@app.before_request
def create_db():
    conn = get_db_connection()
    conn.execute('''CREATE TABLE IF NOT EXISTS player_state (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        score INTEGER NOT NULL,
                        pollution_level INTEGER NOT NULL
                    );''')
    conn.commit()
    conn.close()

if __name__ == '__main__':
    app.run(debug=True)
