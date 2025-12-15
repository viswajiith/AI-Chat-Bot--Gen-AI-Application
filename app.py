from flask import Flask, render_template, request, jsonify, Response
import ollama
import json
import time

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_text():
    try:
        data = request.json
        messages = data.get('messages', [])
        model = data.get('model', 'llama3.2:1b')
        temperature = data.get('temperature', 0.7)
        max_tokens = data.get('max_tokens', 500)
        system_prompt = data.get('system_prompt', 'You are a helpful AI assistant.')

        # Prepare messages with system prompt
        api_messages = [{"role": "system", "content": system_prompt}]
        api_messages.extend(messages)

        # Generate response using Ollama
        response = ollama.chat(
            model=model,
            messages=api_messages,
            options={
                'temperature': temperature,
                'num_predict': max_tokens
            }
        )

        return jsonify({
            'response': response['message']['content'],
            'model': model
        })

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/stream_generate', methods=['POST'])
def stream_generate():
    """Streaming endpoint for real-time response generation"""

    def generate():
        try:
            data = request.json
            messages = data.get('messages', [])
            model = data.get('model', 'llama3.2:1b')
            temperature = data.get('temperature', 0.7)
            system_prompt = data.get('system_prompt', 'You are a helpful AI assistant.')

            # Prepare messages with system prompt
            api_messages = [{"role": "system", "content": system_prompt}]
            api_messages.extend(messages)

            # Stream response
            stream = ollama.chat(
                model=model,
                messages=api_messages,
                stream=True,
                options={'temperature': temperature}
            )

            for chunk in stream:
                if 'message' in chunk and 'content' in chunk['message']:
                    yield f"data: {json.dumps({'content': chunk['message']['content']})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return Response(generate(), mimetype='text/plain')

@app.route('/models')
def get_models():
    """Get available Ollama models"""
    try:
        models = ollama.list()
        llama_models = [
            model['name'] for model in models['models']
            if 'llama3.2' in model['name'].lower()
        ]
        return jsonify({'models': llama_models})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🦙 Starting Llama 3.2 Text Generator...")
    print("📍 Server will be available at: http://localhost:5000")
    print("⚠️  Make sure Ollama is running: ollama serve")
    print("📦 Required models: ollama pull llama3.2:1b")

    app.run(debug=True, host='0.0.0.0', port=5000)
