sudo nano /etc/nginx/sites-available/walletbackend.saumiccraft.in

server {
    listen 80;
    server_name walletbackend.saumiccraft.in;

    location / {
        proxy_pass http://localhost:7500;  # Assuming your Node.js app is running on port 3000
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    error_log /var/log/nginx/walletbackend.saumiccraft.in.error.log;
    access_log /var/log/nginx/walletbackend.saumiccraft.in.access.log;
}


sudo ln -s /etc/nginx/sites-available/walletbackend.saumiccraft.in /etc/nginx/sites-enabled/


sudo nano /etc/nginx/sites-available/wallet.saumiccraft.in

server {
    listen 80;
    server_name wallet.saumiccraft.in; #  Replace it with your own domain 

    root /var/www/html/walletportal/frontend/build; # Replace with the path to your build directory
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    error_log /var/log/nginx/wallet.saumiccraft.in.error.log;
    access_log /var/log/nginx/wallet.saumiccraft.in.access.log;
}


sudo ln -s /etc/nginx/sites-available/wallet.saumiccraft.in /etc/nginx/sites-enabled/

sudo certbot --nginx -d wallet.saumiccraft.in -d walletbackend.saumiccraft.in