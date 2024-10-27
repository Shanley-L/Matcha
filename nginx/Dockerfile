FROM nginx:latest

# config Nginx personnalisée dans le conteneur
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# frontend build (React)
COPY ./frontend/src /var/www/html/frontend

# backend public (Symfony)
COPY ./backend/public /var/www/html/backend

# port par défaut de Nginx
EXPOSE 80
