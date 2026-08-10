import asyncio
from datetime import datetime, timedelta
import uuid
from typing import List, Dict, Any
from services.twilio_service import TwilioService

class SMSScheduler:
    def __init__(self):
        self.scheduled_messages = []
        self.twilio = TwilioService()
        self.is_running = False

    def schedule_message(self, to_phone: str, message: str, send_at: datetime, repeat_days: List[int] = None) -> str:
        msg_id = str(uuid.uuid4())
        self.scheduled_messages.append({
            "id": msg_id,
            "to_phone": to_phone,
            "message": message,
            "send_at": send_at,
            "repeat_days": repeat_days or [],
            "status": "pending"
        })
        return msg_id

    def get_pending_messages(self) -> List[Dict[str, Any]]:
        return sorted(
            [m for m in self.scheduled_messages if m["status"] == "pending"],
            key=lambda x: x["send_at"]
        )

    async def worker_loop(self):
        self.is_running = True
        print("SMS Scheduler Worker Started")
        while self.is_running:
            now = datetime.utcnow()
            for msg in self.scheduled_messages:
                if msg["status"] == "pending" and now >= msg["send_at"]:
                    print(f"Sending scheduled SMS {msg['id']} to {msg['to_phone']}")
                    result = self.twilio.send_sms(msg["to_phone"], msg["message"])
                    
                    if result["status"] == "error":
                        msg["status"] = "error"
                        msg["error_details"] = result.get("message", "")
                    else:
                        # Success. Check if recurring.
                        if msg.get("repeat_days"):
                            # Calculate next date
                            next_date = msg["send_at"] + timedelta(days=1)
                            while next_date.weekday() not in msg["repeat_days"]:
                                next_date += timedelta(days=1)
                            msg["send_at"] = next_date
                            print(f"Rescheduled recurring SMS {msg['id']} to {next_date}")
                        else:
                            msg["status"] = "sent"
            
            # Check every 10 seconds
            await asyncio.sleep(10)

# Global singleton
scheduler = SMSScheduler()
