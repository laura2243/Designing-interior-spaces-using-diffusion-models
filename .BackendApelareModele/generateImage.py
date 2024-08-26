import os
import threading
from pyngrok import ngrok, conf
from flask import Flask, request, jsonify
import torch
from diffusers import AutoPipelineForInpainting, AutoPipelineForText2Image, StableDiffusionXLImg2ImgPipeline
from diffusers.image_processor import IPAdapterMaskProcessor
from transformers import CLIPVisionModelWithProjection
import base64
from PIL import Image, ImageOps
import io
from flask_cors import CORS
from diffusers import StableDiffusionInpaintPipeline
import subprocess


refiner = StableDiffusionXLImg2ImgPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-refiner-1.0", torch_dtype=torch.float16, use_safetensors=True, variant="fp16"
).to("cuda")

generator = torch.Generator("cuda")

autopipeline_for_generate = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16, variant="fp16", use_safetensors=True
)
autopipeline_for_generate.to("cuda")
autopipeline_for_generate.load_lora_weights("SDXL.safetensors")

pipeline_for_textInpaintObject_SD = StableDiffusionInpaintPipeline.from_pretrained(
  "runwayml/stable-diffusion-inpainting",
  torch_dtype=torch.float16,
)

pipeline_for_textInpaint_SDXL_objects = AutoPipelineForInpainting.from_pretrained(
  "diffusers/stable-diffusion-xl-1.0-inpainting-0.1", torch_dtype=torch.float16, variant="fp16"
)

pipeline_for_textInpaint_SDXL_objects.load_lora_weights("lauraObjects.safetensors")
image_encoder = CLIPVisionModelWithProjection.from_pretrained(
      "h94/IP-Adapter",
      subfolder="models/image_encoder",
      torch_dtype=torch.float16
)
pipelineImageInpainting = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
    image_encoder = image_encoder
).to("cuda")



negative_prompt = "unrealistis, low resolution, ugly,painted,unfinished objects, cartoon,Oil painting, drawing,b&w"
positive_prompt = "realistic, ultra hd, high resolution, 8k, "


def generateImages(prompt, strength, negative_prompt, number_of_images, steps, seed):
    if seed is None:
        images = autopipeline_for_generate(
            prompt=prompt,
            num_inference_steps=steps,
            strength=strength,
            apply_watermark=False,
            num_images_per_prompt=number_of_images,
            seed=seed,
            negative_prompt=negative_prompt).images
    else:
        images = autopipeline_for_generate(
            prompt=prompt,
            num_inference_steps=steps,
            strength=strength,
            apply_watermark=False,
            num_images_per_prompt=number_of_images,
            seed=seed,
            negative_prompt=negative_prompt).images

    refinedResultImages = []
    for image in images:
        refinedResultImage = refiner(prompt=prompt, image=image, generator=generator).images[0].resize((1024, 1024))
        torch.cuda.empty_cache()

        byte_arr = io.BytesIO()
        # Save the image to the byte buffer in JPEG format
        refinedResultImage.save(byte_arr, format='JPEG')
        # Get the byte data
        byte_data = byte_arr.getvalue()
        base64_str = base64.b64encode(byte_data).decode('utf-8')

        refinedResultImages.append(base64_str)

    return refinedResultImages


def textInpaintObject(init_image_stream, mask_image_stream, prompt, strength=0.8, isSDXLModel=True):

    init_image_data = base64.b64decode(init_image_stream.split(',')[1])
    # Convert byte array to a file-like object
    init_image = io.BytesIO(init_image_data)
    # Open the image using PIL
    init_image = Image.open(init_image)

    mask_image_data = base64.b64decode(mask_image_stream.split(',')[1])
    mask_image = io.BytesIO(mask_image_data)
    mask_image = Image.open(mask_image)

    init_image = init_image.resize((1024, 1024))
    mask_image = mask_image.resize((1024, 1024))

    if (isSDXLModel):
        pipeline_for_textInpaint_SDXL_objects.enable_model_cpu_offload()
        images = pipeline_for_textInpaint_SDXL_objects(
            prompt=positive_prompt + prompt,
            negative_prompt=negative_prompt,
            image=init_image,
            mask_image=mask_image,
            guidance_scale=8.0,
            num_images_per_prompt=2,
            strength=strength,
            num_inference_steps=30,  # steps between 15 and 30 work well for us
            generator=torch.Generator("cuda"),
        ).images
    else:
        pipeline_for_textInpaintObject_SD.enable_model_cpu_offload()
        images = pipeline_for_textInpaintObject_SD(prompt=positive_prompt + prompt, negative_prompt=negative_prompt,
                                                   image=init_image, mask_image=mask_image, strength=strength,
                                                   generator=generator, num_images_per_prompt=2).images

    base64_strs = []
    for image in images:
        image = image.resize((1024, 1024))
        refinedImage = refiner(prompt="", image=image).images[0]

        byte_arr = io.BytesIO()
        refinedImage.save(byte_arr, format='JPEG')
        byte_data = byte_arr.getvalue()
        base64_str = base64.b64encode(byte_data).decode('utf-8')
        base64_strs.append(base64_str)

    return base64_strs

def removeObjectFromImage(input_image_stream, mask_stream):
    input_image_data = base64.b64decode(input_image_stream.split(',')[1])
    input_image = io.BytesIO(input_image_data)
    input_image = Image.open(input_image)

    mask_data = base64.b64decode(mask_stream.split(',')[1])
    mask = io.BytesIO(mask_data)
    mask = Image.open(mask)

    input_image = input_image.resize((1024, 1024))
    mask = mask.resize((1024, 1024))

    input_image.save('libraries/colab_libs/lama/data_for_prediction/new_background.jpg')
    mask.convert('RGB').save('libraries/colab_libs/lama/data_for_prediction/new_background_mask.png')

    path = "libraries/colab_libs/lama"
    os.chdir(path)

    current_path = os.getcwd()
    print(current_path)

    command = "PYTHONPATH=. TORCH_HOME=$(pwd) python3 bin/predict.py model.path=$(pwd)/big-lama indir=$(pwd)/data_for_prediction outdir=/ralard dataset.img_suffix=.jpg > /dev/null"

    # Run the command
    result = subprocess.run(command, shell=True, executable='/bin/bash', stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # Check the output and errors (if any)
    print("STDOUT:", result.stdout.decode('utf-8'))
    print("STDERR:", result.stderr.decode('utf-8'))

    path = "/ralard"
    os.chdir(path)
    torch.cuda.empty_cache()

    # CHANGE DIRECTORY IN DGX !
    lama_image = Image.open('new_background_mask.png')

    lama_image = lama_image.resize((1024, 1024))

    byte_arr = io.BytesIO()
    lama_image.save(byte_arr, format='JPEG')
    byte_data = byte_arr.getvalue()
    base64_str = base64.b64encode(byte_data).decode('utf-8')

    return base64_str


def imageInpaint(lama_image_stream, mask_object_stream, object_image_stream, prompt, strength=0.8):
    lama_image_data = base64.b64decode(lama_image_stream.split(',')[1])
    lama_image = io.BytesIO(lama_image_data)
    lama_image = Image.open(lama_image)

    mask_object_data = base64.b64decode(mask_object_stream.split(',')[1])
    mask_object = io.BytesIO(mask_object_data)
    mask_object = Image.open(mask_object)

    object_image_data = base64.b64decode(object_image_stream.split(',')[1])
    object_image = io.BytesIO(object_image_data)
    object_image = Image.open(object_image)

    lama_image = lama_image.resize((1024, 1024))
    mask_object = mask_object.resize((1024, 1024))
    object_image = object_image.resize((1024, 1024))

    mask_background = ImageOps.invert(mask_object.convert("RGB"))

    processor = IPAdapterMaskProcessor()
    masks = processor.preprocess([mask_object, mask_background])

    torch.cuda.empty_cache()

    refinedLamaImage = refiner(prompt='', image=lama_image, generator=generator).images[0]

    ip_images = [[object_image], [refinedLamaImage]]

    torch.cuda.empty_cache()

    pipelineImageInpainting.load_ip_adapter("h94/IP-Adapter", subfolder="sdxl_models",
                                            weight_name=["ip-adapter-plus_sdxl_vit-h.safetensors"] * 2)
    pipelineImageInpainting.set_ip_adapter_scale([strength, strength])
    torch.cuda.empty_cache()

    torch.cuda.empty_cache()
    images = pipelineImageInpainting(
        prompt=positive_prompt + prompt,
        ip_adapter_image=ip_images,
        negative_prompt=negative_prompt,
        num_inference_steps=50,
        num_images_per_prompt=2,
        generator=generator,
        cross_attention_kwargs={"ip_adapter_masks": masks}
    ).images

    torch.cuda.empty_cache()
    refinedResultImage1 = refiner(prompt='', image=images[0], generator=generator).images[0]
    refinedResultImage2 = refiner(prompt='', image=images[1], generator=generator).images[0]

    torch.cuda.empty_cache()
    refinedResultImage1 = refinedResultImage1.resize((1024, 1024))
    refinedResultImage2 = refinedResultImage2.resize((1024, 1024))

    byte_arr1 = io.BytesIO()
    byte_arr2 = io.BytesIO()

    refinedResultImage1.save(byte_arr1, format='JPEG')
    refinedResultImage2.save(byte_arr2, format='JPEG')
    # Get the byte data
    byte_data1 = byte_arr1.getvalue()
    base64_str1 = base64.b64encode(byte_data1).decode('utf-8')

    byte_data2 = byte_arr2.getvalue()
    base64_str2 = base64.b64encode(byte_data2).decode('utf-8')

    base64_strs = [base64_str1, base64_str2]
    return base64_strs


conf.get_default().auth_token = '2gmUJpoNX8YpgHW3w7Z5nbIgmTX_RJh9UXczCURmbv5hdaUt'
ngrok_tunnel = ngrok.connect(5000, domain='ferret-genuine-fully.ngrok-free.app')

app = Flask(__name__)
# CORS(app, supports_credentials=True, origins='http://localhost:4200')
CORS(app, resources={r"/*": {"origins": "http://localhost:4200"}})

public_url = ngrok_tunnel.public_url
print(public_url)


# Flask routes

@app.route("/textInpaintObject", methods=['POST'])
def textInpaintObject_request():
    input_image = request.json['image']
    mask_image = request.json['mask']
    prompt = request.json['prompt']
    strength = request.json['strength']
    isSDXLModel = request.json['isSDXLModel']

    return jsonify({
        "image": textInpaintObject(input_image, mask_image, prompt, strength, isSDXLModel)
    }), 200


@app.route("/lama", methods=['POST'])
def removeObjectFromImage_request():
    input_image = request.json['inputImage']
    mask_image = request.json['maskObject']

    return jsonify({
        "image": removeObjectFromImage(input_image, mask_image)
    }), 200


@app.route("/imageInpaintObject", methods=['POST'])
def imageInpaint_request():
    input_image = request.json['inputImage']
    mask_image = request.json['maskObject']
    prompt = request.json['prompt']
    mask_background = request.json['maskBackground']
    inputImageObject = request.json['inputImageObject']
    strength = request.json['strength']
    return jsonify({
        "image": imageInpaint(input_image, mask_image, inputImageObject, prompt, strength)
    }), 200






@app.route("/generate", methods=['POST'])
def generateImages_request():
    prompt = request.json['prompt']
    strength = request.json['strength']
    negative_prompt = request.json['negative_prompt']
    number_of_images = request.json['number_of_images']
    steps = request.json['steps']
    seed = request.json.get('seed', None)

    return jsonify({
        "images": generateImages(prompt, strength, negative_prompt, number_of_images, steps, seed)
    }), 200


# Start the Flask server in a new thread
threading.Thread(target=app.run, kwargs={"use_reloader": False}).start()
