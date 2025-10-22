import os
import zipfile
import shutil
import uuid
from django.conf import settings
from django.http import JsonResponse
import rest_framework
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .utils import classify_images, generate_images_with_gan
from .models import Process

class ProcessCreateView(APIView):
    def post(self, request):
        if 'original_file' not in request.FILES or 'multiplier' not in request.data:
            return Response({'error': 'Missing zip file or multiplier'}, status=status.HTTP_400_BAD_REQUEST)

        zip_file = request.FILES['original_file']
        multiplier = int(request.data['multiplier'])

        # Validate file extension
        if not zip_file.name.endswith('.zip'):
            return Response({'error': 'Only ZIP files are supported'}, status=status.HTTP_400_BAD_REQUEST)

        # Save process instance
        process = Process.objects.create(
            original_file=zip_file,
            multiplier=multiplier
        )

        return Response({'id': process.id}, status=status.HTTP_201_CREATED)

class ProcessDataView(APIView):
    def post(self, request, pk):
        try:
            process = Process.objects.get(pk=pk)
        except Process.DoesNotExist:
            return Response({'error': 'Process not found'}, status=status.HTTP_404_NOT_FOUND)

        zip_path = os.path.join(settings.MEDIA_ROOT, process.original_file.name)
        temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp', str(uuid.uuid4()))
        os.makedirs(temp_dir, exist_ok=True)

        try:
            # Unzip
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)

            # Classify images
            classification_result = classify_images(temp_dir)

            # Check if images were found
            total = classification_result['total_images']
            if total == 0:
                print(f"No valid images found in {temp_dir}")
                return Response({'error': 'No valid images found'}, status=status.HTTP_400_BAD_REQUEST)

            # Extract counts
            pos_count = classification_result['positive_count']
            neg_count = classification_result['negative_count']

            # Decide GAN based on counts
            if pos_count >= neg_count:
                gan_type = 'positive'
                generator_path = os.path.join(settings.BASE_DIR, 'models', 'generator_positive_256.pth')
                # Use steps=6 for positive GAN (this gives perfect circular shapes)
                steps = 6
                resolution = "256x256"
            else:
                gan_type = 'negative'
                generator_path = os.path.join(settings.BASE_DIR, 'models', 'generator_negative_128.pth')
                # Use steps=5 for negative GAN
                steps = 5
                resolution = "128x128"

            # Generate images
            output_dir = os.path.join(settings.MEDIA_ROOT, 'generated', str(uuid.uuid4()))
            os.makedirs(output_dir, exist_ok=True)
            
            # Calculate number of images to generate based on multiplier
            num_images = total * process.multiplier
            
            print(f"🚀 Starting generation with {gan_type} GAN...")
            print(f"📊 Generating {num_images} images (original: {total} × multiplier: {process.multiplier})")
            print(f"🎯 Using steps={steps} for {resolution} resolution")
            
            # Pass steps parameter to the generation function
            generate_images_with_gan(generator_path, output_dir, num_images=num_images, steps=steps)

            # Zip generated images
            generated_zip_path = os.path.join(settings.MEDIA_ROOT, 'generated_zips', f'{gan_type}_generated_{pk}.zip')
            os.makedirs(os.path.dirname(generated_zip_path), exist_ok=True)
            shutil.make_archive(generated_zip_path.replace('.zip', ''), 'zip', output_dir)

            if os.path.exists(generated_zip_path):
                zip_file_size = os.path.getsize(generated_zip_path)
                print(f"✅ Created ZIP file: {generated_zip_path} ({zip_file_size} bytes)")
    
                # Verify it has content
                with zipfile.ZipFile(generated_zip_path, 'r') as zip_ref:
                    file_list = zip_ref.namelist()
                    print(f"📁 ZIP contains {len(file_list)} files")
            else:
                print(f"❌ Failed to create ZIP file: {generated_zip_path}")

            # Update process
            process.classification_summary = classification_result
            process.gan_used = f"{gan_type} (steps={steps}, {resolution})"
            process.processed_file = generated_zip_path.replace(settings.MEDIA_ROOT + '/', '')
            process.save()

            return Response({'message': 'Processing complete'}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in ProcessDataView: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        finally:
            # Cleanup
            shutil.rmtree(temp_dir, ignore_errors=True)
            # if os.path.exists(zip_path):
            #     os.remove(zip_path)

               
class ProcessRetrieveView(APIView):
    def get(self, request, pk):
        try:
            process = Process.objects.get(pk=pk)
        except Process.DoesNotExist:
            return Response({'error': 'Process not found'}, status=status.HTTP_404_NOT_FOUND)

        response = {
            'id': process.id,
            'processed_file': process.processed_file.url if process.processed_file else None,
            'classification_summary': process.classification_summary,
            'gan_used': process.gan_used,
        }
        return Response(response, status=status.HTTP_200_OK)
    
class ModelInspectView(APIView):
    renderer_classes = [rest_framework.renderers.JSONRenderer]  # Add this line
    
    def get(self, request):
        from .utils import inspect_model_architecture
        
        models_to_check = [
            ('generator_positive_256.pth', 'Positive Generator'),
            ('generator_negative_128.pth', 'Negative Generator')
        ]
        
        results = {}
        inspection_logs = []
        
        for model_file, description in models_to_check:
            model_path = os.path.join(settings.BASE_DIR, 'models', model_file)
            if os.path.exists(model_path):
                # Capture the inspection output
                print(f"\n{'='*80}")
                print(f"INSPECTING: {description}")
                print(f"{'='*80}")
                
                # We'll modify inspect_model_architecture to return the data
                try:
                    # For now, just call it and capture console output
                    inspect_model_architecture(model_path)
                    results[description] = {
                        'status': 'success',
                        'path': model_path,
                        'exists': True
                    }
                except Exception as e:
                    results[description] = {
                        'status': 'error',
                        'path': model_path,
                        'error': str(e)
                    }
            else:
                results[description] = {
                    'status': 'not_found',
                    'path': model_path,
                    'exists': False
                }
        
        return Response({
            'message': 'Model inspection initiated - check server console/terminal for detailed architecture output',
            'results': results
        }, status=status.HTTP_200_OK)


