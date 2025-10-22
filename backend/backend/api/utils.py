import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import os
from torchvision.utils import save_image

# === Shared Config ===
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
CLASSIFIER_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'cell_classifier_best.pth')
TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=(0.5,), std=(0.5,))
])
IDX_TO_CLASS = {0: 'Negative', 1: 'positive_selected'}
Z_DIM = 256
W_DIM = 256
IN_CHANNELS = 256
CHANNELS_IMG = 3
FACTORS = [1, 1, 1, 0.5, 0.25, 0.125, 0.0625, 0.03125, 0.03125]

# === Classifier Model  ===
def load_classifier_model():
    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 2)
    model.load_state_dict(torch.load(CLASSIFIER_MODEL_PATH, map_location=DEVICE))
    model.to(DEVICE)
    model.eval()
    return model

def classify_images(input_folder):
    model = load_classifier_model()
    count_by_class = {0: 0, 1: 0}

    with torch.no_grad():
        for root, _, files in os.walk(input_folder):
            for filename in files:
                if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                    image_path = os.path.join(root, filename)
                    try:
                        image = Image.open(image_path).convert('RGB')
                        img_tensor = TRANSFORM(image).unsqueeze(0).to(DEVICE)
                        output = model(img_tensor)
                        pred = torch.argmax(output, dim=1).item()
                        count_by_class[pred] += 1
                    except Exception as e:
                        print(f"Error processing {image_path}: {e}")

    total = sum(count_by_class.values())
    neg_count = count_by_class[0]
    pos_count = count_by_class[1]
    neg_pct = 100 * neg_count / total if total > 0 else 0
    pos_pct = 100 * pos_count / total if total > 0 else 0

    final_class = "POSITIVE" if pos_count >= neg_count else "NEGATIVE"

    return {
        'total_images': total,
        'negative_count': neg_count,
        'negative_pct': f"{neg_pct:.2f}%",
        'positive_count': pos_count,
        'positive_pct': f"{pos_pct:.2f}%",
        'final_classification': final_class
    }

# === GAN Classes ===
class WSLinear(nn.Module):
    def __init__(self, in_features, out_features):
        super(WSLinear, self).__init__()
        self.linear = nn.Linear(in_features, out_features)
        self.scale = (2 / in_features)**0.5
        self.bias = self.linear.bias
        self.linear.bias = None
        nn.init.normal_(self.linear.weight)
        nn.init.zeros_(self.bias)

    def forward(self, x):
        return self.linear(x * self.scale) + self.bias

class PixelNorm(nn.Module):
    def __init__(self):
        super(PixelNorm, self).__init__()
        self.epsilon = 1e-8

    def forward(self, x):
        return x / torch.sqrt(torch.mean(x ** 2, dim=1, keepdim=True) + self.epsilon)

class MappingNetwork(nn.Module):
    def __init__(self, z_dim, w_dim):
        super().__init__()
        self.mapping = nn.Sequential(
            PixelNorm(),
            WSLinear(z_dim, w_dim),
            nn.ReLU(),
            WSLinear(w_dim, w_dim),
            nn.ReLU(),
            WSLinear(w_dim, w_dim),
            nn.ReLU(),
            WSLinear(w_dim, w_dim),
            nn.ReLU(),
            WSLinear(w_dim, w_dim),
            nn.ReLU(),
            WSLinear(w_dim, w_dim),
            nn.ReLU(),
            WSLinear(w_dim, w_dim),
            nn.ReLU(),
            WSLinear(w_dim, w_dim),
        )

    def forward(self, x):
        return self.mapping(x)

class AdaIN(nn.Module):
    def __init__(self, channels, w_dim):
        super().__init__()
        self.instance_norm = nn.InstanceNorm2d(channels)
        self.style_scale = WSLinear(w_dim, channels)
        self.style_bias = WSLinear(w_dim, channels)

    def forward(self, x, w):
        x = self.instance_norm(x)
        style_scale = self.style_scale(w).unsqueeze(2).unsqueeze(3)
        style_bias = self.style_bias(w).unsqueeze(2).unsqueeze(3)
        return style_scale * x + style_bias

class InjectNoise(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.weight = nn.Parameter(torch.zeros(1, channels, 1, 1))

    def forward(self, x):
        noise = torch.randn(x.shape[0], 1, x.shape[2], x.shape[3], device=x.device)
        return x + self.weight * noise

class WSConv2d(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size=3, stride=1, padding=1):
        super(WSConv2d, self).__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding)
        self.scale = (2 / (in_channels * kernel_size ** 2)) ** 0.5
        self.bias = self.conv.bias
        self.conv.bias = None
        nn.init.normal_(self.conv.weight)
        nn.init.zeros_(self.bias)

    def forward(self, x):
        return self.conv(x * self.scale) + self.bias.view(1, self.bias.shape[0], 1, 1)

class GenBlock(nn.Module):
    def __init__(self, in_channels, out_channels, w_dim):
        super(GenBlock, self).__init__()
        self.conv1 = WSConv2d(in_channels, out_channels)
        self.conv2 = WSConv2d(out_channels, out_channels)
        self.leaky = nn.LeakyReLU(0.2, inplace=True)
        self.inject_noise1 = InjectNoise(out_channels)
        self.inject_noise2 = InjectNoise(out_channels)
        self.adain1 = AdaIN(out_channels, w_dim)
        self.adain2 = AdaIN(out_channels, w_dim)

    def forward(self, x, w):
        x = self.conv1(x)
        x = self.inject_noise1(x)
        x = self.leaky(x)
        x = self.adain1(x, w)
        x = self.conv2(x)
        x = self.inject_noise2(x)
        x = self.leaky(x)
        x = self.adain2(x, w)
        return x

class Generator(nn.Module):
    def __init__(self, z_dim, w_dim, in_channels, img_channels=3):
        super(Generator, self).__init__()
        self.starting_constant = nn.Parameter(torch.ones(1, in_channels, 4, 4))
        self.map = MappingNetwork(z_dim, w_dim)
        self.initial_adain1 = AdaIN(in_channels, w_dim)
        self.initial_noise1 = InjectNoise(in_channels)
        self.initial_noise2 = InjectNoise(in_channels)
        self.initial_conv = nn.Conv2d(in_channels, in_channels, kernel_size=3, stride=1, padding=1)
        self.leaky = nn.LeakyReLU(0.2, inplace=True)
        self.initial_adain2 = AdaIN(in_channels, w_dim)
        self.initial_rgb = WSConv2d(in_channels, img_channels, kernel_size=1)

        # Progressive blocks - 8 blocks for resolutions up to 512x512, but we use first 6 for 256x256
        prog_channel_counts = [256, 256, 256, 128, 64, 32, 16, 8]
        
        self.prog_blocks = nn.ModuleList([
            GenBlock(
                in_channels=prog_channel_counts[i-1] if i > 0 else in_channels,  # in_channels for block i
                out_channels=prog_channel_counts[i],
                w_dim=w_dim
            )
            for i in range(len(prog_channel_counts))
        ])

        # RGB layers matching channels after each progressive step (indices 0-8)
        rgb_channel_counts = [256, 256, 256, 256, 128, 64, 32, 16, 8]
        
        self.rgb_layers = nn.ModuleList([
            WSConv2d(rgb_channel_counts[i], img_channels, kernel_size=1)
            for i in range(len(rgb_channel_counts))
        ])

    def forward(self, noise, alpha, steps):
        # Map noise to W space
        w = self.map(noise)
        
        # Start with constant 4x4
        x = self.starting_constant.repeat(noise.shape[0], 1, 1, 1)
        
        # Initial block (stem at 4x4)
        x = self.initial_adain1(self.leaky(self.initial_noise1(x)), w)
        x = self.initial_conv(x)
        x = self.initial_adain2(self.leaky(self.initial_noise2(x)), w)
        
        # Special case for 4x4 (unused, but kept for completeness)
        if steps == 0:
            return self.initial_rgb(x)
        
        # Progressive growing: upsample THEN block for each step
        for step in range(steps):
            # Upsample first (ensures steps upsamplings)
            x = torch.nn.functional.interpolate(x, scale_factor=2, mode='bilinear', align_corners=False)
            # Apply progressive block
            x = self.prog_blocks[step](x, w)
        
        # Convert to RGB at final resolution
        return self.rgb_layers[steps](x)
      
def generate_images_with_gan(generator_path, output_dir, num_images=100, batch_size=10, steps=None):
    try:
        print(f"🔍 Loading generator from: {generator_path}")
        
        # Load the state dict
        state_dict = torch.load(generator_path, map_location=DEVICE)
        
        # Create generator
        gen = Generator(Z_DIM, W_DIM, IN_CHANNELS, CHANNELS_IMG).to(DEVICE)
        
        # Load the state dict
        gen.load_state_dict(state_dict, strict=False)
        gen.eval()

        print(f"✅ Generator loaded successfully")
        
        # Use provided steps
        if steps is not None:
            print(f"🎯 Using provided steps={steps}")
        else:
            # Fallback based on model name
            if '256' in generator_path:
                steps = 6
            elif '128' in generator_path:
                steps = 5
            else:
                steps = 6
            print(f"🎯 Auto-selected steps={steps} based on model name")
        
        # Corrected resolution calculation
        resolution = 4 * (2 ** steps)
        print(f"📐 Target resolution: {resolution}x{resolution}")
        print(f"📊 Generating {num_images} images")

        # Adjust batch size if needed
        if num_images < batch_size:
            batch_size = num_images

        num_batches = num_images // batch_size
        remaining = num_images % batch_size

        generated_count = 0
        
        with torch.no_grad():
            for i in range(num_batches):
                noise = torch.randn(batch_size, Z_DIM).to(DEVICE)
                print(f"🔄 Generating batch {i+1}/{num_batches} (steps={steps}, res={resolution})...")
                
                img = gen(noise, alpha=1, steps=steps)
                print(f"✅ Generated batch {i+1}, shape: {img.shape}")  # Should be [batch, 3, res, res]
                
                for j, single_img in enumerate(img):
                    # Denormalize from [-1, 1] to [0, 1] and save
                    normalized_img = single_img * 0.5 + 0.5
                    save_image(normalized_img, 
                              os.path.join(output_dir, f'generated_{generated_count}.png'))
                    generated_count += 1

                # Debug: Save first image of first batch as sample (for manual inspection)
                if i == 0 and generated_count > 0:
                    sample_path = os.path.join(output_dir, 'debug_sample.png')
                    save_image(normalized_img[0], sample_path)  # First image
                    print(f"🧪 Debug sample saved: {sample_path}")

            if remaining > 0:
                noise = torch.randn(remaining, Z_DIM).to(DEVICE)
                img = gen(noise, alpha=1, steps=steps)
                for j, single_img in enumerate(img):
                    normalized_img = single_img * 0.5 + 0.5
                    save_image(normalized_img, 
                              os.path.join(output_dir, f'generated_{generated_count}.png'))
                    generated_count += 1
                    
        print(f"🎉 Successfully generated {generated_count} images in {output_dir}")
        print(f"📁 Output directory: {output_dir}")
                    
    except Exception as e:
        print(f"❌ Error in generate_images_with_gan: {e}")
        raise
    




    