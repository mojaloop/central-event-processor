# Central Event Processor Setup

***

### 1. Introduction 
In this document we'll walk through the setup for the Mojaloop Central Event Processor. It consists of the following sections:

* [Software List](#2-software-list)
* [Pre-requirements](#3-pre-requirements)
* [Setup](#4-setup)
  * [Installing brew](#41-installing-brew)
  * [Installing Docker](#42-installing-docker)
  * [MongooDB](#43-mongodb)
  * [Postman](#44-postman)
  * [nvm](#45-nvm)
  * [npm](#46-npm)
  * [Installing ZenHub for GitHub](#47-installing-zenhub-for-github)
  * [Run Postman](#48-run-postman)
* [Errors On Setup](#5-errors-on-setup)

***

### 2. Software List
1. Github
2. brew
3. Docker
4. MongoBD
5. Postman
6. nvm
7. npm
8. Zenhub
9. central-event-processor
10. central-ledger
11. ml-api-adapter
12. JavaScript IDE

***

### 3. Pre-requirements
Make sure you have access to [Mojaloop on Github](https://github.com/mojaloop).

The Central-Event-Processing service is part of the greater Mojaloop project.

***

### 4. Setup
Clone the Central Event Processor project.
```http request
https://github.com/mojaloop/central-event-processor
```

#### 4.1. Installing brew
##### macOS
```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```
##### Ubuntu
Install Linuxbrew.
```http request
http://linuxbrew.sh/#install-linuxbrew)
```

#### 4.2. Installing Docker
Install Docker. 
- Docker for Mac
  ```http request
  https://docs.docker.com/docker-for-mac/
  ```
- Docker for Ubuntu
  ```http request
  https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-using-the-repository
  ```

#### 4.3. MongoDB
Installing and running MongoBD as a docker image.
```bash
docker run --name mongo --restart=always -d -p 27017:27017 mongo mongod

docker exec -i -t mongo bash
```

#### 4.4. Postman
##### Installing Postman
Please, follow these instructions:
```http request
https://www.getpostman.com/postman)
```
Alternatively on **Ubuntu** you may run:
```bash
wget https://dl.pstmn.io/download/latest/linux64 -O postman.tar.gz

sudo tar -xzf postman.tar.gz -C /opt

rm postman.tar.gz

sudo ln -s /opt/Postman/Postman /usr/bin/postman
```

##### Setup Postman
* Download the *Mojaloop.postman_collection.json* file
  ```http request
  https://raw.githubusercontent.com/mojaloop/postman/master/Mojaloop.postman_collection.json
  ```
* Open **Postman**
* Click **Import** and then **Import File**
* Select the *Mojaloop.postman_collection.json* file you downloaded
* You'll now need to import environment variables. For local testing, download
  ```http request
  https://raw.githubusercontent.com/mojaloop/postman/master/environments/MojaloopLocal.postman_environment.json
  ```
* Click **Import** and then **Import File**
* Select the *MojaloopLocal.postman_environment.json* file you downloaded
* In the imported collection, navigate to the *central_ledger* directory  

#### 4.5. nvm
###### (This is optional, you can install node directly from the website, node version manager(nvm) isn't really needed unless you want to use multiple versions of node)

If you don't have cURL already installed, on **Ubuntu** run 
```bash
sudo apt install curl
```
Download the nvm install via Homebrew:
```bash
brew update
brew install nvm
mkdir ~/.nvm
vi ~/.bash_profile
```
* Ensure that nvm was installed correctly with `nvm --version`, which should return the version of nvm installed
* Install the version (at time of publish v10.15.3 current LTS) of Node.js you want:
  * Install the latest LTS version with `nvm install --lts`
  * Use the latest LTS verison with `nvm use --lts`
  * Install the latest version with `nvm install node`
  * Use the latest version with `nvm use node`
  * If necessary, fallback to `nvm install v10.15.1`

##### Setup nvm
Create a *.bash_profile* file with 
```bash
touch ~/.bash_profile
```
then open the file for editing
```bash
nano ~/.bash_profile
``` 
write
```text
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm
```

#### 4.6. npm
By installing *node* during *nvm* installation above, you should have the corresponding npm version installed

##### Setup npm
* The _.npmrc_ file in your user root just needs to be present as the repository it will use is 
  ```http request
  http://npmjs.org
  ```
  If it doesn't exist just create it.

All that done, let's run the central event processor!
Make sure you are in the central-event-processor directory, then run:
```bash
npm start
```
Your output should look similar to:
```
> central-event-processor@5.1.0 start /fullpath/central-event-processor
> WITH_SASL=0&&LD_LIBRARY_PATH=$PWD/node_modules/node-rdkafka/build/deps&& node app.js

2019-02-15T08:18:41.323Z - info: Connection with database succeeded.
2019-02-15T08:18:41.332Z - info: CreateHandle::connect - creating Consumer for topics: [topic-notification-event]
```

#### 4.7. Installing ZenHub for GitHub
Open Google Chrome browser and navigate to Zenhub Extension
```http request
https://chrome.google.com/webstore/detail/zenhub-for-github/ogcgkffhplmphkaahpmffcafajaocjbd)
```

#### 4.8. Run Postman
* Use the postman collection from the [postman repo](https://github.com/mojaloop/postman)
* To use this collection, the ml-api-adapter service needs to be running along with the central-ledger service (preferably central-timeout , cental-settlement as well, but they are optional)
* click on **mojaloop v1.0** and then **6.a. Transfer Prepare Request**
* click **Send**
* if you get a valid response, it is a good first step.
* You can also then select the **7.a. Transfer Fulfil Request** and perform a corresponding fulfilment request
* You can check the database to see the transfer state, status changes, positions and other such information. After this if everything looks good, you should be ready to go.

***

### 5. Errors On Setup
* `./src/argon2_node.cpp:6:10: fatal error: 'tuple' file not found` 
  - resolved by running `CXX='clang++ -std=c++11 -stdlib=libc++' npm rebuild`
* sodium v1.2.3 can't compile during npm install
  - resolved by installing v2.0.3 `npm install sodium@2.0.3`
* `
Undefined symbols for architecture x86_64:
  "_CRYPTO_cleanup_all_ex_data", referenced from:
      _rd_kafka_transport_ssl_term in rdkafka_transport.o
  "_CRYPTO_num_locks", referenced from:
  ........
  ld: symbol(s) not found for architecture x86_64
clang: error: linker command failed with exit code 1 (use -v to see invocation) 
`
  - resolved by installing openssl `brew install openssl` and then running: `CFLAGS=-I/usr/local/opt/openssl/include LDFLAGS=-L/usr/local/opt/openssl/lib npm install --save node-rdkafka`
  
***