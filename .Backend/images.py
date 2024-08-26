from setup import db, datetime, DateTime, jsonify, base64, json, request, app, format_date


class Gallery(db.Model):
    __tablename__ = "gallery"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(100), nullable=True)
    is_public = db.Column(db.Boolean, nullable=True)
    input_image = db.Column(db.LargeBinary(100), nullable=True)
    object_image = db.Column(db.LargeBinary(100), nullable=True)
    mask_object = db.Column(db.LargeBinary(100), nullable=True)
    mask_background = db.Column(db.LargeBinary(100), nullable=True)
    result_image = db.Column(db.LargeBinary(100), nullable=True)
    prompt_generation = db.Column(db.String(512), nullable=True)
    prompt_inpaint = db.Column(db.String(512), nullable=True)

    def __init__(self, user_id, is_public, input_image, object_image, mask_object, mask_background, result_image,
                 prompt_generation,
                 prompt_inpaint):
        self.is_public = is_public
        self.user_id = user_id
        self.input_image = input_image
        self.object_image = object_image
        self.mask_object = mask_object
        self.mask_background = mask_background
        self.result_image = result_image

        self.prompt_generation = prompt_generation
        self.prompt_inpaint = prompt_inpaint

    def to_json(self):
        input_image = decode_image(self.input_image)
        object_image = decode_image(self.object_image)
        mask_object = decode_image(self.mask_object)
        mask_background = decode_image(self.mask_background)
        result_image = decode_image(self.result_image)

        return {"id": self.id, "is_public": self.is_public, "user_id": self.user_id, "input_image": input_image,
                "object_image": object_image,
                "mask_object": mask_object,
                "mask_background": mask_background, "result_image": result_image,
                "prompt_generation": self.prompt_generation, "prompt_inpaint": self.prompt_inpaint}

    def __str__(self):
        return str(self.to_json())


def decode_image(image_data):
    if isinstance(image_data, bytes):
        return image_data.decode('utf-8')


@app.route('/gallery/get_all', methods=['GET'])
def get_all_images():
    images = Gallery.query.filter_by(is_public=True).all()
    return jsonify([image.to_json() for image in images])


@app.route('/gallery/get_by_user_id/<string:user_id>', methods=['GET'])
def get_images_by_user_id(user_id):
    images = Gallery.query.filter_by(user_id=user_id).all()
    return jsonify([image.to_json() for image in images])


@app.route('/gallery/add', methods=['POST'])
def add_images_to_gallery():
    gallery_data = json.loads(dict(request.form)['gallery'])

    input_image = request.files.get('inputImage', None)
    object_image = request.files.get('objectImage', None)
    mask_object = request.files.get('maskObject', None)
    mask_background = request.files.get('maskBackground', None)
    result_image = request.files.get('resultImage', None)

    if input_image is not None:
        input_image = input_image.read()
        image_input_data = base64.b64encode(input_image)
    else:
        image_input_data = None
    if object_image is not None:
        object_image = object_image.read()
        object_image_data = base64.b64encode(object_image)
    else:
        object_image_data = None
    if mask_object is not None:
        mask_object = mask_object.read()
        mask_object_data = base64.b64encode(mask_object)
    else:
        mask_object_data = None
    if mask_background is not None:
        mask_background = mask_background.read()
        mask_background_data = base64.b64encode(mask_background)
    else:
        mask_background_data = None
    if result_image is not None:
        result_image = result_image.read()
        result_image_data = base64.b64encode(result_image)
    else:
        result_image_data = None

    prompt_generation = gallery_data.get("promptGeneration")
    prompt_inpaint = gallery_data.get("promptInpaint")
    user_id = gallery_data.get("userId")
    is_public = gallery_data.get("isPublic")

    gallery = Gallery(is_public=is_public, user_id=user_id, input_image=image_input_data, object_image=object_image_data,
                      mask_object=mask_object_data,
                      mask_background=mask_background_data, result_image=result_image_data,
                      prompt_generation=prompt_generation, prompt_inpaint=prompt_inpaint)

    db.session.add(gallery)
    db.session.commit()
    return jsonify({"message": "Gallery Image added successfully"}), 201
