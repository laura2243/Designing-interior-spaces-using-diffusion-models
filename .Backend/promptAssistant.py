import json
import time

from flask import Blueprint, jsonify, request
import openai

from setup import app

gptAssistant_blueprint = Blueprint('prompt-assistant', __name__, url_prefix='/prompt-assistant')

openai.api_key = "add api key"
assistant_id =  "add assistant id"
my_assistant = openai.beta.assistants.retrieve(assistant_id)
assistant_thread = openai.beta.threads.create()


def wait_on_run(run, thread):
    while run.status == "queued" or run.status == "in_progress":
        run = openai.beta.threads.runs.retrieve(
            thread_id=thread.id,
            run_id=run.id
        )
        time.sleep(0.5)

    return run


@app.route('/prompt-assistant', methods=['POST'])
def send_message_to_prompt_assistant():
    message = openai.beta.threads.messages.create(
        thread_id=assistant_thread.id,
        role="user",
        content=request.json.get('message')
    )

    run = openai.beta.threads.runs.create(
        thread_id=assistant_thread.id,
        assistant_id=assistant_id
    )

    run = wait_on_run(run, assistant_thread)

    messages = openai.beta.threads.messages.list(
        thread_id=assistant_thread.id,
        order="asc",
        after=message.id
    )

    return messages.data[0].content[0].text.value
