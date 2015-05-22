#Cubesat
Web app development framework for Meteor.

##Installation
    
    curl https://install.meteor.com | sh 
    npm install -g coffee-script
    npm install -g cubesat
    
##Dependency
Nodejs, Meteor and coffee script

##Example
sat create myapp
cd myapp
sat run

##Envirinment Variables
###CUBESAT_PATH
If not set HOME/.cubesat is default.
###SETTINGS_PATH
If not set $CUBESAT_PATH/settings.coffee is default.
###.env

##Structure
###Exports
####Settings
####Modules
####Parts
####Theme
####Layout

##Files and directories
    ~
        .env                        # dotenv, the first.
        .cubesat                    # $CUBESAT_PATH
            test            
                client
                lib
                server
                packages
                    isaac:cubesat   # git:https://github.com/i4han/cubesat.git
                        .git
            settings.coffee         # $SETTINGS_PATH global settings.
        projects
            myapp
                .env                # dotenv, the second, overwrite the first variables.
                .git
                .gitignore
                .sat
                    config.json
                build
                    client
                        0.jade
                        1.jade
                        absurd.css
                    lib
                        index.js
                index.coffee        # exports.Modules, exports.Settings
    

##Issues

dotenv: ask stu
coffee script binary link has not created on codio.

    npm install -g coffee-script 

##Resources
- meteor
- coffee-script
- jade
- stylus
- eco
- absurd
