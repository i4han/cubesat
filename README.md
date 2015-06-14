
## Cubesat
Web app development framework for Meteor.

## Not Ready
Do not use this package yet unless you really want to try it. 
It is under rapid development and unstable.

## Installation
    
    npm install -g cubesat
    npm install cubesat
    
## Dependency
Meteor 1.0 and coffee script 1.8
Lower version of coffee script may be ok.

## Example
     
    sat create myapp
    cd myapp
    sat run
     

## Structure
    
    exports.Settings = ->
    exports.Modules
    exports.Theme
    exports.Layout
     

## Files and directories
     
    ~
        workspace                       # Your own workspace directory. It cat be any name.
            .env                        # dotenv, the first.
            .cubesat                    # 
                settings.coffee         # $SETTINGS_PATH global settings.
            myapp
                .env                    # dotenv, the second, overwrite the first variables.
                .git
                .gitignore
                .sat
                    config.json         # not yet used.
                build
                    client
                        0.jade
                        1.jade
                        absurd.css
                    lib
                        index.js
                index.coffee            # exports.Modules, exports.Settings
            test            
                client                  # symbolic link
                lib                     # symbolic link
                server                  # symbolic link
                packages
                    isaac:cubesat       # git:https://github.com/i4han/cubesat.git
                        .git
    

## Issues

* [ ] connect with facebook
    * [ ] Deploy to meteor.com
        * [ ] Npm.require Npm.depends don't work.


## Resources
- meteor
- coffee-script
- jade
- stylus
- eco
- absurd
