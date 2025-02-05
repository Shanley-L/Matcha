import os

db_config = {
    'user': os.getenv('BACKEND_DATABASE_NAME'),
    'password': os.getenv('BACKEND_DATABASE_PASSWORD'),
    'host': os.getenv('BACKEND_DATABASE_HOST'),
    'database': os.getenv('BACKEND_DATABASE_NAME'),
    'port': int(os.getenv('BACKEND_DATABASE_PORT'))
}