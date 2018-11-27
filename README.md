# ImageShare
A web program that allows users to upload and view images.

## Access ImageShare on EC2
The web app is correctly running on an AWS EC2 instance, and can be accessed via:
http://ec2-34-239-184-129.compute-1.amazonaws.com:5000/

## To run the project for local development:
### Frontend React Client
To start clinet server, go into client folder, run 
```
npm install
npm start
```

Right now, it is sending requests to the sever hosted on an AWS ec2 instance. This can be changed by changing the baseURL to ''(empty string) inside App.js and requests will be redirected to 'http://localhost:8000' as configured in package.json.

### Backend Nodejs Server
To run server locally, go into server folder, run 
```
npm install
npm start
```
The server will run on port 8000. 

### Database Mongodb
The server is using mongodb, so to correctly run, mongodb database needs to be set up. The database url is set inside mongodbStore.js as dbUrl. 

To configure the database locally without changing the url, these steps are needed:
1. install mongodb locally
2. create a new database named ImageShare
3. create a data folder for database files
4. run mongod --dbpath [path for your data folder]
