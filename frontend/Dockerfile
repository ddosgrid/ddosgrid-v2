FROM nginx
RUN apt-get update; apt-get install -y nodejs npm
COPY . /app
COPY default.conf /etc/nginx/conf.d/default.conf
WORKDIR /app
#RUN npm i; npm run build; rm -rf /usr/share/nginx/html; mv dist /usr/share/nginx/html
RUN npm i; npm run build;
