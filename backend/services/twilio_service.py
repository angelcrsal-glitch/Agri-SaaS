import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

class TwilioService:
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_phone = os.getenv("TWILIO_PHONE_NUMBER")
        
        if not self.account_sid or not self.auth_token:
            print("Warning: Twilio credentials not found. SMS will be disabled.")
            self.client = None
        else:
            self.client = Client(self.account_sid, self.auth_token)
            
    def send_sms(self, to_phone: str, message_body: str):
        if not self.client:
            return {"status": "error", "message": "Twilio not configured"}
            
        try:
            message = self.client.messages.create(
                body=message_body,
                from_=self.from_phone,
                to=to_phone
            )
            return {"status": "success", "message_sid": message.sid}
        except Exception as e:
            print(f"Failed to send SMS: {e}")
            return {"status": "error", "message": str(e)}
