import os
import numpy as np
from flask import Flask, render_template, request, redirect, url_for, jsonify
from PIL import Image
import io
import uuid
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.applications.resnet50 import preprocess_input
from flask_cors import CORS

app = Flask(__name__)
# Configure CORS to allow requests from all origins
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["POST", "OPTIONS", "GET"],
        "allow_headers": ["Content-Type"]
    }
})
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

# Ensure the upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Class names based on the new model's categories
class_names = [
    'E-waste', 'Organics', 'aerosol_cans', 'automobile wastes', 'battery waste',
    'cardboard_boxes', 'clothing', 'food_and_organic_waste', 'glass waste',
    'glass_containers', 'light bulbs', 'metal waste', 'metal_cans',
    'paper_and_print', 'paper_cups', 'plastic disposables', 'plastic waste',
    'plastic_bags', 'plastic_bottles', 'plastic_detergent_bottles',
    'plastic_food_containers', 'shoes', 'steel_food_cans',
    'styrofoam_containers', 'utensils'
]

# --- NEW: Mapping to Functional Categories ---
functional_categories_map = {
    'E-waste': ['Recyclable (Special Handling)', 'Resellable'],
    'Organics': ['Biodegradable (Compostable)'],
    'aerosol_cans': ['Recyclable (Empty, Check Local)'],
    'automobile wastes': ['Recyclable (Special Handling)', 'Resellable (Parts)'],
    'battery waste': ['Recyclable (Special Handling)'],
    'cardboard_boxes': ['Recyclable', 'Biodegradable'],
    'clothing': ['Reusable', 'Resellable', 'Biodegradable (Natural Fibers)', 'Recyclable (Textile Programs)'],
    'food_and_organic_waste': ['Biodegradable (Compostable)'],
    'glass waste': ['Recyclable'],
    'glass_containers': ['Recyclable', 'Reusable', 'Resellable'],
    'light bulbs': ['Recyclable (Special Handling)'],
    'metal waste': ['Recyclable', 'Resellable'],
    'metal_cans': ['Recyclable'],
    'paper_and_print': ['Recyclable', 'Biodegradable'],
    'paper_cups': ['Recyclable (Check Local)', 'Biodegradable (If unlined)'],
    'plastic disposables': ['Check Local (Often Not Recyclable)'],
    'plastic waste': ['Check Local (Depends on Type)'], # Too general
    'plastic_bags': ['Recyclable (Special Programs)'],
    'plastic_bottles': ['Recyclable'],
    'plastic_detergent_bottles': ['Recyclable (Check Local)', 'Reusable (Non-food)'],
    'plastic_food_containers': ['Recyclable (Check Type/Local)', 'Reusable'],
    'shoes': ['Reusable', 'Resellable', 'Recyclable (Special Programs)'],
    'steel_food_cans': ['Recyclable'],
    'styrofoam_containers': ['Check Local (Often Not Recyclable)'],
    'utensils': ['Reusable', 'Resellable (Metal)', 'Check Local (Plastic)']
}
# Ensure all classes have an entry, add default if missing (optional safety net)
for cls in class_names:
    if cls not in functional_categories_map:
        functional_categories_map[cls] = ['Check Local Guidelines']
# --- End NEW Mapping ---

# Path to the model (use absolute path based on script location)
# Try multiple possible filenames
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
POSSIBLE_MODEL_NAMES = [
    'model.keras',
    'EcoScan_2 (1).keras',
    'EcoScan_2.keras',
    'EcoScan.keras',
    '3RVision_2 (1).keras',  # Legacy filename support
    '3RVision_2.keras',  # Legacy filename support
    '3RVision.keras'  # Legacy filename support
]

MODEL_PATH = None
for name in POSSIBLE_MODEL_NAMES:
    path = os.path.join(SCRIPT_DIR, name)
    if os.path.exists(path):
        MODEL_PATH = path
        print(f"Found model file: {name}")
        break

if MODEL_PATH is None:
    print("=" * 60)
    print("ERROR: Model file not found!")
    print("Please ensure one of these files exists in the ml folder:")
    for name in POSSIBLE_MODEL_NAMES:
        print(f"  - {name}")
    print("=" * 60)
    model = None
else:
    # Load the actual Keras model
    try:
        print(f"Loading model from: {MODEL_PATH}")
        model = load_model(MODEL_PATH)
        print("Keras model loaded successfully!")
    except Exception as e:
        print(f"Error loading Keras model: {e}")
        model = None

# Add this after other global variables
ml_results_store = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def preprocess_image(image_path, target_size=(224, 224)):
    """Preprocess the image using ResNet50 standards."""
    # Load the image using Keras utility
    img = load_img(image_path, target_size=target_size)
    
    # Convert the image to a numpy array
    img_array = img_to_array(img)
    
    # Add a batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    # Preprocess the image using ResNet50's specific function
    img_array = preprocess_input(img_array)
    
    return img_array

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ml-results/<filename>', methods=['GET'])
def get_ml_results(filename):
    if filename in ml_results_store:
        return jsonify(ml_results_store[filename])
    return jsonify({'error': 'ML results not found'}), 404

def analyze_image(file):
    """Helper function to analyze an image file."""
    if model is None:
        return None, "Model not loaded"
    
    try:
        # Create a unique filename
        ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'jpg'
        filename = f"{uuid.uuid4().hex}.{ext}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Save the file
        file.save(file_path)
        
        print("Starting image preprocessing")
        # Make prediction using the loaded Keras model
        preprocessed_img = preprocess_image(file_path)
        print("Image preprocessed, making prediction")
        
        predictions = model.predict(preprocessed_img, verbose=0)
        print("Prediction complete")
        
        predicted_class_idx = np.argmax(predictions[0])
        predicted_class = class_names[predicted_class_idx]
        confidence = float(predictions[0][predicted_class_idx]) * 100
        
        # Get Functional Categories
        functional_cats = functional_categories_map.get(predicted_class, ['Check Local Guidelines'])

        print(f"Prediction result: {predicted_class} with {confidence}% confidence")
        
        return {
            'success': True,
            'predicted_class': predicted_class,
            'confidence': confidence,
            'functional_categories': functional_cats,
            'categories': functional_cats,
            'filename': filename
        }, None
        
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        import traceback
        traceback.print_exc()
        return None, str(e)

@app.route('/analyze', methods=['POST'])
def analyze():
    """Endpoint for Go backend to get categories."""
    print("Analyze endpoint hit")
    
    if 'image' not in request.files:
        print("No image in request.files")
        return jsonify({'error': 'No image provided', 'categories': ['general waste']}), 400
    
    file = request.files['image']
    print(f"Received image: {file.filename}")
    
    if file.filename == '':
        print("Empty filename")
        return jsonify({'error': 'No file selected', 'categories': ['general waste']}), 400
    
    if file and allowed_file(file.filename):
        result, error = analyze_image(file)
        if error:
            return jsonify({'error': error, 'categories': ['general waste']}), 500
        return jsonify({'categories': result['categories']})
    
    print("Invalid file type")
    return jsonify({'error': 'Invalid file type', 'categories': ['general waste']}), 400

@app.route('/upload', methods=['POST'])
def upload_file():
    print("Upload endpoint hit")
    
    if 'file' not in request.files:
        print("No file in request.files")
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    print(f"Received file: {file.filename}")
    
    if file.filename == '':
        print("Empty filename")
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        result, error = analyze_image(file)
        if error:
            return jsonify({'error': error}), 500
        return jsonify(result)
    
    print("Invalid file type")
    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    # Make sure the app runs only if the model loaded successfully
    if model is not None:
        app.run(host='0.0.0.0', port=5001, debug=True)
    else:
        print("Application cannot start because the model failed to load.")