const debugging = require("../debugging.js");
const discordModule = require("../discordModule.js");
const mongoUtil = require("../mongoUtil.js");
const botConfig = require('../.././config.json');
const e6 = require('../e6.js');

const { exit } = require('process');

function processMessage(msg, client, args){

    //Update the bot
    if (args[0] === `update`) {
        exit(1);
    }

    //Assign Mod Role
    else if (args[0] === `add-mod`){
        discordModule.effectMember(msg.guild.member(msg.mentions.users.first()), msg, USERMOD.MAKEMOD);
        return true;
    }

    //Remove a mod
    else if (args[0] === `remove-mod`){
        discordModule.effectMember(msg.guild.member(msg.mentions.users.first()), msg, USERMOD.REMOVEMOD);
        return true;
    }

    //Assign Mod Role
    else if (args[0] === `assign-mod-role`){
        if (args[1]){
            //Validate role exists
            msg.guild.roles.fetch(args[1])
                .then(role => {
                    if (role !== null){
                        botConfig.roles.modRole = role.id;
                        discordModule.saveConfig();
                        msg.reply(`Assigned ${role} as mod role`);
                    }
                    else {
                        msg.reply("Role ID doesn't exist"); 
                    }
                })
                .catch(err => {
                    msg.reply(err);
                })
        }
        else{
            msg.reply("You must supply a role id");
        }
        return true;
    }

    //Assign Quote channel
    else if (args[0] === `set-quote-channel`){
        if (args.length > 1){
            //Validate role exists
            let channel = msg.guild.channels.cache.get(args[1])
            if (channel !== undefined){
                botConfig.channels.quotes = channel.id;
                quoteChannel = channel;
                discordModule.saveConfig();
                msg.reply(`Assigned ${channel} as quote channel`);
            }
            else{
                msg.reply("Channel ID doesn't exist or hidden")
            }
        }
        else{
            msg.reply("Please specify a channel id");
        }
        return true;
    }

    //Assign Verified channel
    else if (args[0] === `set-verified-channel`){
        if (args.length > 1){
            //Validate role exists
            let channel = msg.guild.channels.cache.get(args[1])
            if (channel !== undefined){
                botConfig.channels.verified = channel.id;
                verifiedChannel = channel;
                discordModule.saveConfig();
                msg.reply(`Assigned ${channel} as verifed channel`);
            }
            else{
                msg.reply("Channel ID doesn't exist or hidden")
            }
        }
        else{
            msg.reply("Please specify a channel id");
        }
        return true;
    }

    //Assign Events channel
    else if (args[0] === `set-events-channel`){
        if (args.length > 1){
            //Validate role exists
            let channel = msg.guild.channels.cache.get(args[1])
            if (channel !== undefined){
                botConfig.channels.eventsChannel = channel.id;
                discordModule.saveConfig();
                eventsChannel = channel;
                msg.reply(`Assigned ${channel} as event channel`);
            }
            else{
                msg.reply("Channel ID doesn't exist or hidden")
            }
        }
        else{
            msg.reply("Please specify a channel id");
        }
        return true;
    }

    //Assign NSFW channel
    else if (args[0] === `set-nsfw-quote-channel`){
        if (args.length > 1){
            //Validate role exists
            let channel = msg.guild.channels.cache.get(args[1])
            if (channel !== undefined){
                if (channel.nsfw){
                    botConfig.channels.nsfwquotes = channel.id;
                    discordModule.saveConfig();
                    nsfwQuoteChannel = channel;
                    msg.reply(`Assigned ${channel} as nsfw quote channel`);
                }
                else{
                    msg.reply("Channel isn't marked nsfw!")
                }
            }
            else{
                msg.reply("Channel ID doesn't exist or hidden")
            }
        }
        else{
            msg.reply("Please specify a channel id");
        }
        return true;
    }

    //Assign Petition channel
    else if (args[0] === `set-petition-channel`){
        if (args.length > 1){
            //Validate role exists
            let channel = msg.guild.channels.cache.get(args[1])
            if (channel !== undefined){
                botConfig.channels.petitions = channel.id;
                discordModule.saveConfig();
                petitionChannel = channel;
                msg.reply(`Assigned ${channel} as petition channel`);
            }
            else{
                msg.reply("Channel ID doesn't exist or hidden")
            }
        }
        else{
            msg.reply("Please specify a channel id");
        }
        return true;
    }

    //Stop role from being assigned by everyone
    else if (args[0] === `remove-role-assignable`){
        if (args[1]){
            //For every role supplied
            for (let i = 1; i < args.length; i++) {
                //Validate role exists
                msg.guild.roles.fetch(args[i])
                .then(role => {
                    if (role !== null){
                        //Find the role and remove it
                        for (let j = 0; j < botConfig.roles.publicRoles.length; j++) {
                            if (botConfig.roles.publicRoles[j] == role.id){
                                botConfig.roles.publicRoles.splice(j, 1);
                                break;
                            }
                        }
                        discordModule.saveConfig();
                        msg.reply(`Removed ${role} role from public list`);
                    }
                    else {
                        msg.reply("Role ID doesn't exist"); 
                    }
                })
                .catch(err => {
                    msg.reply(err);
                })
            }
        }
        else{
            msg.reply("You must supply a role id");
        }
        return true;
    }

    //Set role as assignable by everyone
    else if (args[0] === `set-role-assignable`){
        if (args[1]){
            //For every role supplied
            for (let i = 1; i < args.length; i++) {
                //Validate role exists
                msg.guild.roles.fetch(args[i])
                .then(role => {
                    if (role !== null){
                        //Check that this role isn't already in our list
                        var found = false;
                        for (let j = 0; j < botConfig.roles.publicRoles.length; j++) {
                            if (botConfig.roles.publicRoles[j] == role.id){
                                found = true;
                                break;
                            }
                        }
                        if (found){
                            msg.reply(`${role} is already assigned to public list`);
                            return true;
                        }

                        botConfig.roles.publicRoles.push([role.id, role.name]);
                        discordModule.saveConfig();
                        msg.reply(`Assigned ${role} role to public list`);
                    }
                    else {
                        msg.reply("Role ID doesn't exist"); 
                    }
                })
                .catch(err => {
                    msg.reply(err);
                })
            }
        }
        else{
            msg.reply("You must supply a role id");
        }
        return true;
    }

    //Assign Verify Role
    else if (args[0] === `assign-verified-role`){
        if (args[1]){
            //Validate role exists
            msg.guild.roles.fetch(args[1])
                .then(role => {
                    if (role !== null){
                        botConfig.roles.verifiedRole = role.id;
                        discordModule.saveConfig();
                        msg.reply(`Assigned ${role} as verified role`);
                    }
                    else {
                        msg.reply("Role ID doesn't exist"); 
                    }role
                })
                .catch(err => {
                    msg.reply(err);
                })
        }
        else{
            msg.reply("You must supply a role id");
        }
        return true;
    }

    //Assign Did not read info
    else if (args[0] === `assign-didnotread-role`){
        if (args[1]){
            //Validate role exists
            msg.guild.roles.fetch(args[1])
                .then(role => {
                    if (role !== null){
                        botConfig.roles.didNotReadInfoRole = role.id;
                        discordModule.saveConfig();
                        msg.reply(`Assigned ${role} as didNotReadInfo role`);
                    }
                    else {
                        msg.reply("Role ID doesn't exist"); 
                    }
                })
                .catch(err => {
                    msg.reply(err);
                })
        }
        else{
            msg.reply("You must supply a role id");
        }
        return true;
    }
    //----
    //E6
    //----
    else if (args[0] === `e6-reset`){
        e6.clearTags();
        msg.reply("Done.");
        return true;
    }

    //Assign E6 channel
    else if (args[0] === `e6-set-channel`){
        if (args.length > 1){
            //Validate role exists
            let channel = msg.guild.channels.cache.get(args[1])
            if (channel !== undefined){
                botConfig.e621.e6Channel = channel.id;
                discordModule.saveConfig();
                msg.reply(`Assigned ${channel} as e621 channel`);
            }
            else{
                msg.reply("Channel ID doesn't exist or hidden")
            }
        }
        else{
            msg.reply("Please specify a channel id");
        }
        return true;
    }

    return false;
}

function getHelpBlock(msg){
    let help = ("```" + `
    [ Admin ]
    ${botConfig.prefix}add-mod <member> - assigns the mod role to a user
    ${botConfig.prefix}add-role-assignable <id> - adds a role to the assignable list
    ${botConfig.prefix}set-role-assignable <id> - Makes role assignable by anyone
    ${botConfig.prefix}assign-mod-role <id> - assigns the mod role
    ${botConfig.prefix}assign-verified-role <id> - assigns the verified role
    ${botConfig.prefix}assign-didnotread-role <id> - assigns the did not read info role, prevents a user from being verified
    ${botConfig.prefix}e6-reset - resets all lists to nothing, including blacklist
    ${botConfig.prefix}e6-set-channel <id> - Assigns e6 channel
    ${botConfig.prefix}remove-mod <member> - removes the mod role from a user
    ${botConfig.prefix}set-nsfw-quote-channel <id> - Assign nsfw quote channel
    ${botConfig.prefix}set-petition-channel <id> - Assigns the petition channel
    ${botConfig.prefix}set-quote-channel <id> - Assign quote channel
    ${botConfig.prefix}set-verified-channel <id> - Assigns the verified channel
    ${botConfig.prefix}set-events-channel <id> - Assign events channel
    ${botConfig.prefix}remove-role-assignable <id> - removes a role from the assignable list
    ` + "```");
    msg.author.send(help);
}

//Exports
module.exports.processMessage = processMessage;
module.exports.getHelpBlock = getHelpBlock;