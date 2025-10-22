# inspect_models.py
import os
import sys
import django
import torch

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.utils import inspect_model_architecture

def main():
    models_to_check = [
        ('generator_positive_256.pth', 'Positive Generator'),
        ('generator_negative_128.pth', 'Negative Generator')
    ]
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    for model_file, description in models_to_check:
        model_path = os.path.join(base_dir, 'models', model_file)
        print(f"\n{'='*100}")
        print(f"INSPECTING: {description}")
        print(f"PATH: {model_path}")
        print(f"{'='*100}")
        
        if os.path.exists(model_path):
            inspect_model_architecture(model_path)
        else:
            print(f"❌ FILE NOT FOUND: {model_path}")
        
        print(f"{'='*100}\n")

if __name__ == '__main__':
    main()