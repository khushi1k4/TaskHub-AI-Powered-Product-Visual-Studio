from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.task_routes import task_bp
from routes.ai_generations import ai_bp
from config import Config

def create_app():
    app = Flask(__name__)
    CORS(app, origins=["https://taskhub-ai-visual.vercel.app", "http://localhost:3000"])
    app.config.from_object(Config)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(task_bp, url_prefix='/api/tasks')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')

    @app.route('/health', methods=['GET'])
    def health_check():
        return {"status": "healthy"}, 200

    @app.after_request
    def log_400(response):
        if response.status_code == 400:
            from flask import request
            with open("400_errors.txt", "a") as f:
                f.write(f"400 on {request.method} {request.path}: {response.get_data(as_text=True)}\n")
        return response

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0")