from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import os
from motor.motor_asyncio import AsyncIOMotorClient
import jwt
from datetime import datetime, timedelta
import uuid
import bcrypt
import csv
import io
from contextlib import asynccontextmanager

# Database setup
MONGO_URL = os.environ.get('MONGO_URL', "mongodb://localhost:27017")
DB_NAME = os.environ.get('DB_NAME', "test_database")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# JWT settings
SECRET_KEY = "microxisto-secret-key-2025"
ALGORITHM = "HS256"
security = HTTPBearer()

# Pydantic models
class Technology(BaseModel):
    id: Optional[str] = None
    name: str
    logo: str
    description: str

class Culture(BaseModel):
    id: Optional[str] = None
    name: str
    image: str  # URL da figurinha/ícone
    link: str   # Link para pasta de arquivos

class ProductComposition(BaseModel):
    N: float = 0
    P: float = 0
    K: float = 0
    Ca: float = 0
    Mg: float = 0
    S: float = 0
    Mo: float = 0
    Co: float = 0
    Zn: float = 0
    B: float = 0
    Cu: float = 0
    Mn: float = 0
    Ni: float = 0
    Se: float = 0
    Si: float = 0
    Fe: float = 0

class Product(BaseModel):
    id: Optional[str] = None
    name: str
    logo: str
    technology_id: str
    density: float
    nature: str  # "Líquido" ou "Sólido"
    composition: ProductComposition
    additives: str
    description: str
    materials_url: Optional[str] = ""
    proposito: Optional[str] = ""  # NOVO CAMPO para sugestões

class Competitor(BaseModel):
    id: Optional[str] = None
    company: str
    product: str
    logo: Optional[str] = ""
    density: float
    nature: str
    composition: ProductComposition
    additives: str
    proposito: Optional[str] = ""  # NOVO CAMPO

class User(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    password: Optional[str] = None
    is_admin: bool = False
    is_approved: bool = False
    created_at: Optional[datetime] = None

class UserRegistration(BaseModel):
    email: EmailStr
    password: str

class UserApproval(BaseModel):
    user_id: str
    approved: bool

class LoginRequest(BaseModel):
    email: str
    password: str

class HomeContent(BaseModel):
    text: str
    pdf_url: Optional[str] = None

class TechnologyUpdate(BaseModel):
    name: str
    logo: str
    description: str

class ProductUpdate(BaseModel):
    name: str
    logo: str
    technology_id: str
    density: float
    nature: str
    composition: ProductComposition
    additives: str
    description: str
    materials_url: Optional[str] = ""
    proposito: Optional[str] = ""  # NOVO CAMPO

class CompetitorUpdate(BaseModel):
    company: str
    product: str
    logo: Optional[str] = ""
    density: float
    nature: str
    composition: ProductComposition
    additives: str
    proposito: Optional[str] = ""  # NOVO CAMPO

# Lifespan manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize default data
    await initialize_default_data()
    yield

app = FastAPI(lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth helpers
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)  # 7 dias em vez de 24 horas
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Initialize default data
async def initialize_default_data():
    # Create admin user
    admin_exists = await db.users.find_one({"email": "agrofialho@gmail.com"})
    if not admin_exists:
        admin_user = {
            "id": str(uuid.uuid4()),
            "email": "agrofialho@gmail.com",
            "password": hash_password("adm@123"),
            "is_admin": True,
            "is_approved": True
        }
        await db.users.insert_one(admin_user)

    # Initialize technologies
    technologies_exist = await db.technologies.count_documents({})
    if technologies_exist == 0:
        technologies = [
            {
                "id": str(uuid.uuid4()),
                "name": "AquaX",
                "logo": "https://i.imgur.com/C1n0y7l.png",
                "description": "Tecnologia avançada para nutrição aquática de plantas"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "MicroX",
                "logo": "https://i.imgur.com/xQOsNWd.png",
                "description": "Micronutrientes de alta eficiência e absorção rápida"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "NanoX",
                "logo": "https://i.imgur.com/X1nSIwA.png",
                "description": "Nanotecnologia aplicada à nutrição vegetal"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "BioX",
                "logo": "https://i.imgur.com/Ev41QpU.png",
                "description": "Bioestimulantes naturais para máximo desempenho"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "FemtoX",
                "logo": "https://i.imgur.com/U3hgNcO.png",
                "description": "Tecnologia femto para nutrição de precisão"
            }
        ]
        await db.technologies.insert_many(technologies)

    # Initialize sample products
    products_exist = await db.products.count_documents({})
    if products_exist == 0:
        tech_aquax = await db.technologies.find_one({"name": "AquaX"})
        tech_microx = await db.technologies.find_one({"name": "MicroX"})
        
        sample_products = [
            {
                "id": str(uuid.uuid4()),
                "name": "AquaX Premium",
                "logo": "https://i.imgur.com/C1n0y7l.png",
                "technology_id": tech_aquax["id"],
                "density": 1.25,
                "nature": "Líquido",
                "composition": {
                    "N": 15, "P": 5, "K": 10, "Ca": 8, "Mg": 3,
                    "S": 2, "Mo": 0.5, "Co": 0.1, "Zn": 2, "B": 1,
                    "Cu": 0.5, "Mn": 1.5, "Ni": 0.2, "Se": 0.1, "Si": 5, "Fe": 3
                },
                "additives": "Aminoácidos + Extrato de algas marinhas",
                "description": "Fertilizante líquido premium da linha AquaX com tecnologia avançada",
                "materials_url": ""
            },
            {
                "id": str(uuid.uuid4()),
                "name": "MicroX Essential",
                "logo": "https://i.imgur.com/xQOsNWd.png",
                "technology_id": tech_microx["id"],
                "density": 1.15,
                "nature": "Líquido",
                "composition": {
                    "N": 12, "P": 3, "K": 8, "Ca": 6, "Mg": 2,
                    "S": 3, "Mo": 1, "Co": 0.2, "Zn": 3, "B": 1.5,
                    "Cu": 1, "Mn": 2, "Ni": 0.3, "Se": 0.2, "Si": 4, "Fe": 4
                },
                "additives": "Complexo de micronutrientes quelados",
                "description": "Micronutrientes essenciais com alta disponibilidade",
                "materials_url": ""
            }
        ]
        await db.products.insert_many(sample_products)

    # Initialize competitor data
    competitors_exist = await db.competitors.count_documents({})
    if competitors_exist == 0:
        competitors = [
            {
                "id": str(uuid.uuid4()),
                "company": "Kimberlit",
                "product": "KBT Radicel",
                "logo": "",
                "density": 1.55,
                "nature": "líquido",
                "composition": {
                    "N": 0, "P": 0, "K": 0, "Ca": 0, "Mg": 0,
                    "S": 0, "Mo": 7.75, "Co": 0.775, "Zn": 31, "B": 0,
                    "Cu": 0, "Mn": 0, "Ni": 1.55, "Se": 0, "Si": 0, "Fe": 0
                },
                "additives": "Aminoácidos + Ext. Algas"
            },
            {
                "id": str(uuid.uuid4()),
                "company": "Kimberlit",
                "product": "Exion Vida",
                "logo": "",
                "density": 1.19,
                "nature": "líquido",
                "composition": {
                    "N": 0, "P": 0, "K": 0, "Ca": 0, "Mg": 4.284,
                    "S": 0, "Mo": 0, "Co": 0, "Zn": 1.785, "B": 1.19,
                    "Cu": 1.19, "Mn": 0, "Ni": 0, "Se": 0, "Si": 0, "Fe": 0
                },
                "additives": "Aminoácidos, + substâncias húmicas"
            },
            {
                "id": str(uuid.uuid4()),
                "company": "Kimberlit",
                "product": "Exion Potencer Ultra",
                "logo": "",
                "density": 1.07,
                "nature": "líquido",
                "composition": {
                    "N": 0, "P": 0, "K": 0, "Ca": 1.07, "Mg": 1.07,
                    "S": 0, "Mo": 0, "Co": 0, "Zn": 0, "B": 0,
                    "Cu": 0, "Mn": 0, "Ni": 0.428, "Se": 0, "Si": 0, "Fe": 0
                },
                "additives": "Auxicina + Citocinina"
            }
        ]
        await db.competitors.insert_many(competitors)

    # Initialize home content
    home_exists = await db.home_content.find_one({})
    if not home_exists:
        await db.home_content.insert_one({
            "id": str(uuid.uuid4()),
            "text": "Bem-vindo ao sistema MicroXisto! Explore nossas tecnologias avançadas em nutrição vegetal.",
            "pdf_url": None
        })
    
    # Initialize cultures - NOVA FUNCIONALIDADE
    cultures_exist = await db.cultures.count_documents({})
    if cultures_exist == 0:
        cultures = [
            {
                "id": str(uuid.uuid4()),
                "name": "Soja",
                "image": "https://i.imgur.com/soybean-icon.png",  # Você pode substituir por URLs reais
                "link": "https://drive.google.com/drive/folders/soja-microxisto",
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Milho", 
                "image": "https://i.imgur.com/corn-icon.png",
                "link": "https://drive.google.com/drive/folders/milho-microxisto",
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Algodão",
                "image": "https://i.imgur.com/cotton-icon.png",
                "link": "https://drive.google.com/drive/folders/algodao-microxisto",
                "created_at": datetime.utcnow()
            }
        ]
        await db.cultures.insert_many(cultures)

# Routes
@app.post("/api/auth/register")
async def register_user(user_data: UserRegistration):
    # Validar email @microxisto.com.br
    if not user_data.email.endswith("@microxisto.com.br"):
        raise HTTPException(status_code=400, detail="Email deve ser @microxisto.com.br")
    
    # Verificar se usuário já existe
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Criar usuário
    user = {
        "id": str(uuid.uuid4()),
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "is_admin": False,
        "is_approved": False,
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(user)
    return {"message": "Usuário cadastrado. Aguarde aprovação do administrador."}

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    user = await db.users.find_one({"email": request.email})
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user["is_approved"]:
        raise HTTPException(status_code=401, detail="Account not approved")
    
    access_token = create_access_token(data={"sub": user["id"]})
    return {"access_token": access_token, "token_type": "bearer", "is_admin": user["is_admin"]}

@app.get("/api/technologies")
async def get_technologies():
    technologies = await db.technologies.find({}, {"_id": 0}).to_list(None)
    return technologies

@app.get("/api/technologies/{tech_id}/products")
async def get_products_by_technology(tech_id: str):
    products = await db.products.find({"technology_id": tech_id}, {"_id": 0}).to_list(None)
    return products

# ==========================================
# CULTURES APIs - NOVA FUNCIONALIDADE  
# ==========================================

@app.get("/api/cultures")
async def get_cultures():
    """Get all cultures for users"""
    cultures = await db.cultures.find({}, {"_id": 0}).to_list(None)
    return cultures

@app.post("/api/admin/cultures")
async def create_culture(culture: Culture, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Create new culture (admin only)"""
    try:
        # Verify admin token
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("is_admin"):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Create culture with unique ID
        culture_data = culture.dict()
        culture_data["id"] = str(uuid.uuid4())
        culture_data["created_at"] = datetime.utcnow()
        
        await db.cultures.insert_one(culture_data)
        return {"message": "Culture created successfully", "culture": culture_data}
    
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.put("/api/admin/cultures/{culture_id}")
async def update_culture(culture_id: str, culture: Culture, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Update culture (admin only)"""
    try:
        # Verify admin token
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("is_admin"):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Update culture
        culture_data = culture.dict()
        culture_data["updated_at"] = datetime.utcnow()
        
        result = await db.cultures.update_one(
            {"id": culture_id}, 
            {"$set": culture_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Culture not found")
        
        return {"message": "Culture updated successfully"}
    
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.delete("/api/admin/cultures/{culture_id}")
async def delete_culture(culture_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Delete culture (admin only)"""
    try:
        # Verify admin token  
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("is_admin"):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Delete culture
        result = await db.cultures.delete_one({"id": culture_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Culture not found")
        
        return {"message": "Culture deleted successfully"}
    
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/api/admin/cultures")
async def get_all_cultures_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get all cultures for admin management"""
    try:
        # Verify admin token
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("is_admin"):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        cultures = await db.cultures.find({}, {"_id": 0}).to_list(None)
        return cultures
    
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==========================================
# END CULTURES APIs
# ==========================================

@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.get("/api/competitors/companies")
async def get_competitor_companies():
    pipeline = [
        {"$group": {"_id": "$company"}},
        {"$sort": {"_id": 1}}
    ]
    companies = await db.competitors.aggregate(pipeline).to_list(None)
    return [{"company": item["_id"]} for item in companies]

@app.get("/api/competitors/companies/{company}/products")
async def get_competitor_products(company: str):
    products = await db.competitors.find({"company": company}, {"_id": 0}).to_list(None)
    return products

@app.get("/api/competitors/{competitor_id}")
async def get_competitor(competitor_id: str):
    competitor = await db.competitors.find_one({"id": competitor_id}, {"_id": 0})
    if not competitor:
        raise HTTPException(status_code=404, detail="Competitor not found")
    return competitor

@app.get("/api/home")
async def get_home_content():
    content = await db.home_content.find_one({}, {"_id": 0})
    return content if content else {"text": "", "pdf_url": None}

# Admin routes - User Management
@app.get("/api/admin/users")
async def get_all_users(admin_user: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(None)
    return users

@app.get("/api/admin/users/pending")
async def get_pending_users(admin_user: dict = Depends(get_admin_user)):
    users = await db.users.find({"is_approved": False}, {"_id": 0, "password": 0}).to_list(None)
    return users

@app.post("/api/admin/users/approve")
async def approve_user(approval: UserApproval, admin_user: dict = Depends(get_admin_user)):
    result = await db.users.update_one(
        {"id": approval.user_id},
        {"$set": {"is_approved": approval.approved}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    action = "aprovado" if approval.approved else "rejeitado"
    return {"message": f"Usuário {action} com sucesso"}

@app.delete("/api/admin/users/{user_id}")
async def delete_user(user_id: str, admin_user: dict = Depends(get_admin_user)):
    # Não permitir excluir admin principal
    user_to_delete = await db.users.find_one({"id": user_id})
    if user_to_delete and user_to_delete.get("email") == "agrofialho@gmail.com":
        raise HTTPException(status_code=400, detail="Cannot delete main admin")
    
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Usuário removido com sucesso"}

# Admin routes - Technologies Management
@app.put("/api/admin/technologies/{tech_id}")
async def update_technology(tech_id: str, tech_data: TechnologyUpdate, admin_user: dict = Depends(get_admin_user)):
    result = await db.technologies.update_one(
        {"id": tech_id},
        {"$set": tech_data.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Technology not found")
    return {"message": "Tecnologia atualizada com sucesso"}

@app.delete("/api/admin/technologies/{tech_id}")
async def delete_technology(tech_id: str, admin_user: dict = Depends(get_admin_user)):
    # Verificar se há produtos associados
    products_count = await db.products.count_documents({"technology_id": tech_id})
    if products_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete technology with associated products")
    
    result = await db.technologies.delete_one({"id": tech_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Technology not found")
    
    return {"message": "Tecnologia removida com sucesso"}

# Admin routes - Products Management  
@app.get("/api/admin/products")
async def get_all_products(admin_user: dict = Depends(get_admin_user)):
    products = await db.products.find({}, {"_id": 0}).to_list(None)
    return products

@app.put("/api/admin/products/{product_id}")
async def update_product(product_id: str, product_data: ProductUpdate, admin_user: dict = Depends(get_admin_user)):
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": product_data.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Produto atualizado com sucesso"}

@app.delete("/api/admin/products/{product_id}")
async def delete_product(product_id: str, admin_user: dict = Depends(get_admin_user)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Produto removido com sucesso"}

# Admin routes - Competitors Management
@app.get("/api/admin/competitors")
async def get_all_competitors(admin_user: dict = Depends(get_admin_user)):
    competitors = await db.competitors.find({}, {"_id": 0}).to_list(None)
    return competitors

@app.put("/api/admin/competitors/{competitor_id}")
async def update_competitor(competitor_id: str, competitor_data: CompetitorUpdate, admin_user: dict = Depends(get_admin_user)):
    result = await db.competitors.update_one(
        {"id": competitor_id},
        {"$set": competitor_data.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Competitor not found")
    return {"message": "Concorrente atualizado com sucesso"}

@app.delete("/api/admin/competitors/{competitor_id}")
async def delete_competitor(competitor_id: str, admin_user: dict = Depends(get_admin_user)):
    result = await db.competitors.delete_one({"id": competitor_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Competitor not found")
    
    return {"message": "Concorrente removido com sucesso"}

# Admin routes - CSV Import
@app.post("/api/admin/competitors/import-csv")
async def import_competitors_csv(file: UploadFile = File(...), admin_user: dict = Depends(get_admin_user)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV format")
    
    try:
        content = await file.read()
        csv_content = content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        
        imported_count = 0
        errors = []
        
        expected_columns = [
            'Empresa', 'Produto', 'Densidade', 'Natureza',
            'N', 'P', 'K', 'Ca', 'Mg', 'S', 'Mo', 'Co',
            'Zn', 'B', 'Cu', 'Mn', 'Ni', 'Se', 'Si', 'Fe'
        ]
        
        for row_num, row in enumerate(csv_reader, start=2):
            try:
                competitor = {
                    "id": str(uuid.uuid4()),
                    "company": row.get('Empresa', '').strip(),
                    "product": row.get('Produto', '').strip(),
                    "logo": "",
                    "density": float(row.get('Densidade', 0) or 0),
                    "nature": row.get('Natureza', '').strip().lower(),
                    "composition": {
                        "N": float(row.get('N', 0) or 0),
                        "P": float(row.get('P', 0) or 0),
                        "K": float(row.get('K', 0) or 0),
                        "Ca": float(row.get('Ca', 0) or 0),
                        "Mg": float(row.get('Mg', 0) or 0),
                        "S": float(row.get('S', 0) or 0),
                        "Mo": float(row.get('Mo', 0) or 0),
                        "Co": float(row.get('Co', 0) or 0),
                        "Zn": float(row.get('Zn', 0) or 0),
                        "B": float(row.get('B', 0) or 0),
                        "Cu": float(row.get('Cu', 0) or 0),
                        "Mn": float(row.get('Mn', 0) or 0),
                        "Ni": float(row.get('Ni', 0) or 0),
                        "Se": float(row.get('Se', 0) or 0),
                        "Si": float(row.get('Si', 0) or 0),
                        "Fe": float(row.get('Fe', 0) or 0)
                    },
                    "additives": row.get('Aditivos', '').strip() if 'Aditivos' in row else ""
                }
                
                if competitor["company"] and competitor["product"]:
                    await db.competitors.insert_one(competitor)
                    imported_count += 1
                else:
                    errors.append(f"Linha {row_num}: Empresa e Produto são obrigatórios")
                    
            except Exception as e:
                errors.append(f"Linha {row_num}: {str(e)}")
        
        return {
            "message": f"Importação concluída: {imported_count} concorrentes importados",
            "imported_count": imported_count,
            "errors": errors
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")

@app.post("/api/admin/home")
async def update_home_content(content: HomeContent, admin_user: dict = Depends(get_admin_user)):
    await db.home_content.update_one(
        {},
        {"$set": {"text": content.text, "pdf_url": content.pdf_url}},
        upsert=True
    )
    return {"message": "Home content updated"}

@app.post("/api/admin/technologies")
async def create_technology(tech: Technology, admin_user: dict = Depends(get_admin_user)):
    tech.id = str(uuid.uuid4())
    await db.technologies.insert_one(tech.dict())
    return tech

@app.post("/api/admin/products")
async def create_product(product: Product, admin_user: dict = Depends(get_admin_user)):
    product.id = str(uuid.uuid4())
    await db.products.insert_one(product.dict())
    return product

@app.post("/api/admin/competitors")
async def create_competitor(competitor: Competitor, admin_user: dict = Depends(get_admin_user)):
    competitor.id = str(uuid.uuid4())
    await db.competitors.insert_one(competitor.dict())
    return competitor

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)