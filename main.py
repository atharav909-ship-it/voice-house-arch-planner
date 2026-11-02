import os
from dotenv import load_dotenv
from sarvamai import SarvamAI

# Load environment variables from .env
load_dotenv()

# Initialize Sarvam client (reads SARVAM_API_KEY from environment)
client = SarvamAI(api_subscription_key=os.getenv("SARVAM_API_KEY"))

# Make a chat completion call
response = client.chat.completions(
    model="sarvam-105b-conversations",
    messages=[
        {"role": "user", "content": "Hello! Introduce yourself briefly in one sentence."}
    ],
)

# Print the reply
print(response.choices[0].message.content)
