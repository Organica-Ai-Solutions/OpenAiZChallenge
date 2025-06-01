# Simple authentication endpoints for testing
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import uuid

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class UserResponse(BaseModel):
    username: str
    role: str
    user_id: str

# Simple in-memory user store (in production, use database)
simple_users = {
    "admin": {
        "username": "admin", 
        "password": "admin123",  # In production, use hashed passwords
        "role": "admin",
        "user_id": str(uuid.uuid4())
    },
    "researcher": {
        "username": "researcher",
        "password": "research123",
        "role": "researcher", 
        "user_id": str(uuid.uuid4())
    }
}

# Simple token store (in production, use Redis or JWT)
active_tokens = {}

@app.post("/auth/token", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Simple login endpoint for testing authentication."""
    user = simple_users.get(request.username)
    
    if not user or user["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate simple token (in production, use JWT)
    token = f"token_{uuid.uuid4()}"
    expires_in = 3600  # 1 hour
    
    # Store token with expiration
    active_tokens[token] = {
        "user": user,
        "expires_at": datetime.now() + timedelta(seconds=expires_in)
    }
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=expires_in
    )

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user(authorization: Optional[str] = None):
    """Get current user information."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split(" ")[1]
    
    if token not in active_tokens:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    token_data = active_tokens[token]
    
    # Check if token is expired
    if datetime.now() > token_data["expires_at"]:
        del active_tokens[token]
        raise HTTPException(status_code=401, detail="Token expired")
    
    user = token_data["user"]
    return UserResponse(
        username=user["username"],
        role=user["role"],
        user_id=user["user_id"]
    )

@app.delete("/auth/logout")
async def logout(authorization: Optional[str] = None):
    """Logout endpoint to invalidate token."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        if token in active_tokens:
            del active_tokens[token]
    
    return {"message": "Logged out successfully"} 