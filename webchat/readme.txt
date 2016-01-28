Currently, the chat server and the RESTServer are completely standalone and do not depend on eachother. Each of them have their 
own vagrantfile. We will be merging later on as the project progresses.

We have created a rough framework that supports statically created chatrooms as well as basic functionalities such as handling disconnects,
send and receiving messages, switching chatrooms and user supplied username (these are all temporary and stored on application memory.)

Rest Server
you can:
login
create users
create rooms
view rooms
share rooms
view rooms
Features:
Full authentications
password hashing
Working api
JWT token with expiry session
Working mongodb

The two vagrant files are located:

RESTServer ./vagrantfile
chat-server ./chat-exp/vagrantfile

To install and setup RESTServer and database:
--------------------------------------------------------------
run vagrant up on the root folder

to get RESTServer(ExpressJS and nodeJS) running must do the following
vagrant ssh
cd project/RESTServer sudo npm install -g (only on first build or rebuilds needed to download all dependancies and must be in folder before executing)

mongo use mydb

nodemon bin/www (must be in folder before executing)

go to your local browser, and navigate to http://localhost:8080



To run chat server:
----------------------------------------------------------------
run vagrant up on the ./chat-exp/ folder.

go to your local browser, and navigate to http://localhost:8088