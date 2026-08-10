from supabase import Client
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class FieldCreate(BaseModel):
    name: str
    polygon: Dict[str, Any] # GeoJSON
    crop_type: Optional[str] = "generic"
    user_id: str # Passed from auth context or request

class FieldResponse(FieldCreate):
    id: str
    created_at: datetime

class FieldsService:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.table = "fields"

    def create_field(self, field: FieldCreate) -> Dict[str, Any]:
        data = field.model_dump()
        response = self.supabase.table(self.table).insert(data).execute()
        # access data using .data 
        if response.data:
            return response.data[0]
        return None

    def get_user_fields(self, user_id: str) -> List[Dict[str, Any]]:
        response = self.supabase.table(self.table).select("*").eq("user_id", user_id).execute()
        return response.data
